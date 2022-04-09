import { Address } from "../Address";
import { CosmWasm } from "./useCosmWasm";
import "./Profile.css";

export interface ProfileProps {
  cosmWasm: CosmWasm;
}

export function Profile(props: ProfileProps) {
  const { address, connect, disconnect } = props.cosmWasm;

  return (
    <div className="profile">
      {address ? (
        <>
          <button onClick={disconnect}>Disconnect Keplr</button>
          <br />
          <small>
            <Address address={address} />
          </small>
        </>
      ) : (
        <>
          <button onClick={connect}>Connect Keplr</button>
        </>
      )}
    </div>
  );
}
