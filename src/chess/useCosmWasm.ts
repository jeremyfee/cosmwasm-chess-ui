import { useEffect, useRef, useState } from "react";
import { Coin, StdFee } from "@cosmjs/amino";
import {
  CosmWasmClient,
  ExecuteResult,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { ChainInfo, Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  interface Window extends KeplrWindow {}
}

export interface CosmWasmState {
  address?: string;
  error?: Error;
}

export interface CosmWasm extends CosmWasmState {
  connect: () => void;
  disconnect: () => void;
  execute: (
    contractAddress: string,
    msg: Record<string, unknown>,
    fee?: number | StdFee | "auto",
    memo?: string | undefined,
    funds?: readonly Coin[] | undefined
  ) => Promise<ExecuteResult>;
  queryContractSmart: (
    contractAddress: string,
    queryMsg: Record<string, unknown>
  ) => Promise<any>;
}

export function useCosmWasm(
  chainInfo: ChainInfo,
  defaultFee: number | StdFee | "auto" = { amount: [], gas: "200000" }
): CosmWasm {
  const ALREADY_CONNECTED_KEY = `connected_${chainInfo.chainId}`;
  const queryClient = useRef<CosmWasmClient | undefined>(undefined);
  const signingClient = useRef<SigningCosmWasmClient | undefined>(undefined);
  const [state, setState] = useState<CosmWasmState>({});

  useEffect(() => {
    // connect if previously connected
    if (localStorage.getItem(ALREADY_CONNECTED_KEY)) {
      connect();
    }
    // listen for address changes
    window.addEventListener("keplr_keystorechange", connect);
    return () => {
      window.removeEventListener("keplr_keystorechange", connect);
    };
  }, [chainInfo]);

  return {
    ...state,
    connect,
    disconnect,
    execute,
    queryContractSmart,
  };

  function connect() {
    (async () => {
      await connectSigningClient();
    })();
  }

  function disconnect() {
    if (signingClient.current) {
      signingClient.current.disconnect();
      signingClient.current = undefined;
      localStorage.removeItem(ALREADY_CONNECTED_KEY);
    }
    setState((state) => {
      return {
        ...state,
        address: undefined,
      };
    });
  }

  async function connectSigningClient(): Promise<
    SigningCosmWasmClient | undefined
  > {
    return Promise.resolve()
      .then(async () => {
        if (
          !window.keplr ||
          !window.getOfflineSigner ||
          !window.keplr.experimentalSuggestChain
        ) {
          throw new Error("Keplr not installed");
        }
        await window.keplr.experimentalSuggestChain(chainInfo);
        await window.keplr.enable(chainInfo.chainId);
        const offlineSigner = await window.getOfflineSigner(chainInfo.chainId);
        const accounts = await offlineSigner.getAccounts();
        const client = await SigningCosmWasmClient.connectWithSigner(
          chainInfo.rpc,
          offlineSigner
        );
        signingClient.current = client;
        setState((state) => {
          return {
            ...state,
            address: accounts[0].address,
            error: undefined,
          };
        });
        localStorage.setItem(ALREADY_CONNECTED_KEY, "true");
        return client;
      })
      .catch((error) => {
        setState((state) => {
          return { ...state, error };
        });
        return undefined;
      });
  }

  async function execute(
    contractAddress: string,
    msg: Record<string, unknown>,
    fee?: number | StdFee | "auto",
    memo?: string | undefined,
    funds?: readonly Coin[] | undefined
  ): Promise<ExecuteResult> {
    if (!state.address || !signingClient.current) {
      await connectSigningClient();
      if (!state.address || !signingClient.current) {
        return Promise.reject(new Error("Unable to execute"));
      }
    }
    return signingClient.current.execute(
      state.address,
      contractAddress,
      msg,
      fee ?? defaultFee,
      memo,
      funds
    );
  }

  async function queryContractSmart(
    contractAddress: string,
    queryMsg: Record<string, unknown>
  ): Promise<any> {
    let client = signingClient.current || queryClient.current;
    if (!client) {
      client = await CosmWasmClient.connect(chainInfo.rpc);
      queryClient.current = client;
    }
    return client.queryContractSmart(contractAddress, queryMsg);
  }
}
