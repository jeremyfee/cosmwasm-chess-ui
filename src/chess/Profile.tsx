import { CosmWasm } from "./useCosmWasm";

export interface ProfileProps {
  cosmWasm: CosmWasm;
}

export function Profile(props: ProfileProps) {
  const { address, formatAddress, connect, disconnect } = props.cosmWasm;

  return (
    <div className="profile">
      {address ? (
        <>
          <button onClick={disconnect}>Disconnect Keplr</button>
          <br />
          <small>{formatAddress(address)}</small>
        </>
      ) : (
        <>
          <button onClick={connect}>Connect Keplr</button>
        </>
      )}
    </div>
  );
}
