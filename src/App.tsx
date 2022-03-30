import "./App.css";
import { NavLink, Outlet } from "react-router-dom";

import { Profile } from "./chess/Profile";
import { CosmWasmChess } from "./chess/CosmWasmChess";
import { useCosmWasm } from "./chess/useCosmWasm";

// import { CHAIN_INFO, CONTRACT } from "./config/testnet";
import { CHAIN_INFO, CONTRACT } from "./config/juno";

function App() {
  const cosmWasm = useCosmWasm(CHAIN_INFO);
  const contract = new CosmWasmChess(cosmWasm, CONTRACT);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "";

  function onAddressClick(className: string) {
    const address = document.querySelector("." + className);
    if (!address) {
      return;
    }
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(address);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

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
            <br />
            <code
              className="juno-address"
              onClick={() => onAddressClick("juno-address")}
            >
              juno1qzmu3y33vhwhexwwtctp7e3fn20qnfphy3f04w
            </code>
          </p>
        </small>
      </footer>
    </div>
  );
}

export default App;
