import { useEffect, useState } from "react";
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
  client?: CosmWasmClient;
  error?: Error;
  signingClient?: SigningCosmWasmClient;
}

export interface CosmWasm extends CosmWasmState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
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

  const [state, setState] = useState<CosmWasmState>({});
  const [addressChanges, setAddressChanges] = useState(0);

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", onAddressChange);

    (async () => {
      if (localStorage.getItem(ALREADY_CONNECTED_KEY)) {
        await connectSigningClient();
      } else {
        await connectQueryClient();
      }
    })();

    return () => {
      window.removeEventListener("keplr_keystorechange", onAddressChange);
    };
  }, [chainInfo, addressChanges]);

  return {
    ...state,
    connect,
    disconnect,
    execute,
    queryContractSmart,
  };

  async function connect() {
    return connectSigningClient();
  }

  async function disconnect() {
    if (state.signingClient) {
      state.signingClient.disconnect();
    }
    setState((state) => {
      return {
        ...state,
        address: undefined,
        signingClient: undefined,
      };
    });
  }

  async function connectSigningClient() {
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
        const signingClient = await SigningCosmWasmClient.connectWithSigner(
          chainInfo.rpc,
          offlineSigner
        );
        const accounts = await offlineSigner.getAccounts();
        setState((state) => {
          return {
            ...state,
            address: accounts[0].address,
            error: undefined,
            signingClient,
          };
        });
        localStorage.setItem(ALREADY_CONNECTED_KEY, "true");
      })
      .catch((error) => {
        setState((state) => {
          return { ...state, error };
        });
      });
  }

  async function connectQueryClient() {
    return Promise.resolve()
      .then(async () => {
        const client = await CosmWasmClient.connect(chainInfo.rpc);
        setState((state) => {
          return { ...state, client };
        });
      })
      .catch((error) => {
        setState((state) => {
          return { ...state, error };
        });
      });
  }

  async function execute(
    contractAddress: string,
    msg: Record<string, unknown>,
    fee?: number | StdFee | "auto",
    memo?: string | undefined,
    funds?: readonly Coin[] | undefined
  ): Promise<ExecuteResult> {
    if (!state.address || !state.signingClient) {
      await connectSigningClient();
      if (!state.address || !state.signingClient) {
        return Promise.reject(new Error("Wallet not connected"));
      }
    }
    return state.signingClient.execute(
      state.address,
      contractAddress,
      msg,
      fee ?? defaultFee,
      memo,
      funds
    );
  }

  function onAddressChange() {
    setAddressChanges(addressChanges + 1);
  }

  async function queryContractSmart(
    contractAddress: string,
    queryMsg: Record<string, unknown>
  ): Promise<any> {
    let client = state.signingClient || state.client;
    if (!client) {
      await connectQueryClient();
      client = state.client;
      if (!client) {
        return Promise.reject("Unable to query");
      }
    }
    return client?.queryContractSmart(contractAddress, queryMsg);
  }
}
