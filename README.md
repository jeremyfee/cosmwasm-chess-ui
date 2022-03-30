# cosmwasm-chess-ui

https://junochess.pages.dev/

A React front end for cosmwasm-chess smart contract for creating and playing chess games.

## Overview

Users can view, create, and accept challenges, and take turns playing chess games.

The contract supports paging lists of games and challenges, as well as filtering by
game status, but the UI does not yet.

## Development Notes

Using `@cosmjs/cosmwasm-stargate` and related libraries for working with Keplr.
It seems like queries should work without a wallet, but haven't figured that out yet.
The `useCosmWasm` hook can probably be improved for this purpose.

Contract interfaces and interactions with CosmWasm client are in
`src/chess/CosmWasmChess.ts` .

Using `chess.js` for move validation and related chess logic. Tried using
`ChessboardJsx` for a front-end, but only supported drag interactions
instead of click. Using a custom board implmentation for now.

### Local Testing

After starting local node in cosmwasm-chess
( https://github.com/jeremyfee/cosmwasm-chess ),
update imports from juno to testnet in `src/App.tsx`, then:

```bash
yarn install
yarn dev
```
