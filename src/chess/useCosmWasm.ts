import React, { useEffect, useRef, useState } from "react";
import { Coin, StdFee } from "@cosmjs/amino";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { ChainInfo, Keplr } from "@keplr-wallet/types";
import {
  CosmWasmClient,
  ExecuteResult,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";

import { JUNO_CHAIN_INFO } from "../config/juno";

// extend window with CosmJS and Keplr properties
interface KeplrWindow extends Window {
  keplr: Keplr;
  getOfflineSigner(chainId: string): Promise<OfflineSigner>;
}

declare let window: KeplrWindow;

export interface CosmWasmState {
  address?: string;
  client?: CosmWasmClient;
  initialized?: boolean;
  signingClient?: SigningCosmWasmClient;
}

export interface CosmWasm extends CosmWasmState {
  chainInfo: ChainInfo;
  connect: () => Promise<void>;
  disconnect: () => void;
  execute: (
    contractAddress: string,
    msg: Record<string, unknown>,
    fee?: number | StdFee | "auto",
    memo?: string | undefined,
    funds?: readonly Coin[] | undefined
  ) => Promise<ExecuteResult>;
  formatAddress: (address?: string) => string;
  queryContractSmart: (
    contractAddress: string,
    queryMsg: Record<string, unknown>
  ) => Promise<any>;
}

export function useCosmWasm(
  chainInfo: ChainInfo,
  defaultFee: number | StdFee | "auto" = { amount: [], gas: "10000" }
): CosmWasm {
  const ALREADY_CONNECTED_KEY = `connected_${chainInfo.chainId}`;

  const client = useRef<CosmWasmClient | undefined>();
  const signingClient = useRef<SigningCosmWasmClient | undefined>();

  const [state, setState] = useState<CosmWasmState>({});

  useEffect(() => {
    (async () => {
      await initialize();
      if (localStorage.getItem(chainInfo.chainId)) {
        await connect();
      }
    })();
  }, [chainInfo]);

  async function initialize(): Promise<void> {
    if (!window.keplr || !window.getOfflineSigner) {
      throw new Error("Keplr extension not installed");
    }
    if (!window.keplr.experimentalSuggestChain) {
      throw new Error("Old version of keplr");
    }
    await window.keplr.experimentalSuggestChain(chainInfo);
    await window.keplr.enable(chainInfo.chainId);
    // connect query client automatically
    client.current = await CosmWasmClient.connect(chainInfo.rpc);
    setState((state) => {
      return { ...state, client: client.current, initialized: true };
    });
  }

  async function connect(): Promise<void> {
    if (!state.initialized) {
      await initialize();
    }
    const offlineSigner = await window.getOfflineSigner(chainInfo.chainId);
    signingClient.current = await SigningCosmWasmClient.connectWithSigner(
      chainInfo.rpc,
      offlineSigner
    );
    const accounts = await offlineSigner.getAccounts();
    setState((state) => {
      return {
        ...state,
        address: accounts[0].address,
        signingClient: signingClient.current,
      };
    });
    localStorage.setItem(chainInfo.chainId, "true");
  }

  function disconnect(): void {
    if (signingClient.current) {
      signingClient.current.disconnect();
    }
    localStorage.removeItem(chainInfo.chainId);
    setState((state) => {
      return {
        ...state,
        address: undefined,
        signingClient: undefined,
      };
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
      await connect();
    }
    if (!state.address || !signingClient.current) {
      throw new Error("unable to connect");
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

  function formatAddress(address?: string, empty: string = "-"): string {
    if (!address) {
      return empty;
    } else {
      const prefix = chainInfo.bech32Config.bech32PrefixAccAddr.length;
      return `${address.substring(0, 5 + prefix)}...${address.substring(
        address.length - 5
      )}`;
    }
  }

  async function queryContractSmart(
    contractAddress: string,
    queryMsg: Record<string, unknown>
  ): Promise<any> {
    if (!client.current) {
      await initialize();
    }
    if (!client.current) {
      // initialize should set client
      throw new Error("initialize failed");
    }
    return client.current.queryContractSmart(contractAddress, queryMsg);
  }

  return {
    ...state,
    chainInfo,
    connect,
    disconnect,
    execute,
    formatAddress,
    queryContractSmart,
  };
}
