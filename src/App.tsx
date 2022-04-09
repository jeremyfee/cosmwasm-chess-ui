import "./App.css";
import { NavLink, Outlet } from "react-router-dom";

import { Profile } from "./chess/Profile";
import { CosmWasmChess } from "./chess/CosmWasmChess";
import { useCosmWasm } from "./chess/useCosmWasm";

// import { CHAIN_INFO, CONTRACT } from "./config/testnet";
import { CHAIN_INFO, CONTRACT } from "./config/juno";
import { Address } from "./Address";

function App() {
  const cosmWasm = useCosmWasm(CHAIN_INFO);
  const contract = new CosmWasmChess(cosmWasm, CONTRACT);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "";

  return (
    <div className="App">
      <h1>JunoChess</h1>

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

      <footer>
        <small>
          <p>
            Contract source code:{" "}
            <a href="https://github.com/jeremyfee/cosmwasm-chess/tree/0.4.1">
              https://github.com/jeremyfee/cosmwasm-chess/tree/0.4.1
            </a>
            <br />
            UI source code:{" "}
            <a href="https://github.com/jeremyfee/cosmwasm-chess-ui">
              https://github.com/jeremyfee/cosmwasm-chess-ui
            </a>
          </p>
          <p>
            Created by:{" "}
            <Address address="juno1qzmu3y33vhwhexwwtctp7e3fn20qnfphy3f04w" />
          </p>
        </small>
      </footer>
    </div>
  );
}

export default App;
