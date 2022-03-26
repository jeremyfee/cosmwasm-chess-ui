import { ChainInfo, Currency } from "@keplr-wallet/types";

const JUNO: Currency = {
  coinDenom: "JUNO",
  coinMinimalDenom: "ujuno",
  coinDecimals: 6,
  coinGeckoId: "juno-network",
};

export const JUNO_CHAIN_INFO: ChainInfo = {
  chainId: "juno-1",
  chainName: "Juno",
  rpc: "https://rpc.juno.omniflix.co",
  rest: "https://api.juno.omniflix.co",
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
  currencies: [JUNO],
  feeCurrencies: [JUNO],
  coinType: 118,
  gasPriceStep: {
    low: 0.01,
    average: 0.025,
    high: 0.04,
  },
};
