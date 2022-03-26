import { ChainInfo, Currency } from "@keplr-wallet/types";

const STAKE: Currency = {
  coinDenom: "STAKE",
  coinMinimalDenom: "ustake",
  coinDecimals: 6,
};

const JUNO: Currency = {
  coinDenom: "JUNO",
  coinMinimalDenom: "ujuno",
  coinDecimals: 6,
};

export const TESTING_CHAIN_INFO: ChainInfo = {
  chainId: "testing",
  chainName: "Testing",
  rpc: "http://127.0.0.1:26657",
  rest: "http://127.0.0.1:1317",
  stakeCurrency: JUNO,
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "juno",
    bech32PrefixAccPub: "junopub",
    bech32PrefixValAddr: "junovaloper",
    bech32PrefixValPub: "junovaloperpub",
    bech32PrefixConsAddr: "junovalcons",
    bech32PrefixConsPub: "junovalconspub",
  },
  currencies: [JUNO, STAKE],
  feeCurrencies: [JUNO],
  coinType: 118,
  beta: true,
  gasPriceStep: {
    low: 0.01,
    average: 0.025,
    high: 0.04,
  },
};
