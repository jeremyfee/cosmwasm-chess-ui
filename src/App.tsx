import "./App.css";
import { NavLink, Outlet } from "react-router-dom";

import { Profile } from "./chess/Profile";
import { CosmWasmChess } from "./chess/CosmWasmChess";
import { useCosmWasm } from "./chess/useCosmWasm";

import { TESTING_CHAIN_INFO } from "./config/testnet";

function App() {
  const CONTRACT =
    "juno14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9skjuwg8";

  const cosmWasm = useCosmWasm(TESTING_CHAIN_INFO);
  const contract = new CosmWasmChess(cosmWasm, CONTRACT);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "";

  return (
    <div className="App">
      <h1>Chess</h1>

      <nav>
        <NavLink className={navClass} to="challenges/">
          Challenges
        </NavLink>
        <NavLink className={navClass} to="games/">
          Games
        </NavLink>
        <Profile cosmWasm={cosmWasm} />
      </nav>

      <main>
        <Outlet context={contract} />
      </main>
    </div>
  );
}

export default App;
