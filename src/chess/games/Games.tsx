import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import { ChessGameSummary, CosmWasmChess } from "../CosmWasmChess";
import "./Games.css";

export function Games() {
  const contract = useOutletContext<CosmWasmChess>();
  const [state, setState] = useState<{
    games?: ChessGameSummary[];
    status?: string;
    error?: unknown;
  }>({});

  useEffect(() => {
    loadGames();
  }, [contract.address]);

  function formatAddress(address?: string) {
    if (contract.address && contract.address === address) {
      return "You";
    } else {
      return contract.client.formatAddress(address);
    }
  }

  async function loadGames(): Promise<void> {
    setState({ ...state, status: "Loading games" });
    return contract
      .getGames(contract.address)
      .then((games: ChessGameSummary[]) => {
        setState((state) => {
          return { ...state, games, status: undefined };
        });
      })
      .catch((error: any) => {
        setState((stat) => {
          return { ...state, error, status: undefined };
        });
      });
  }

  return (
    <>
      <h2>Games</h2>
      {state.error ? <p className="error">{`${state.error}`}</p> : <></>}
      {state.status ? <p className="status">{state.status}</p> : <></>}

      {state.games ? (
        <table className="games">
          <thead>
            <tr>
              <th>ID</th>
              <th>White</th>
              <th>Black</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {state.games.map((g, key) => (
              <tr key={key} className={g.status ? "gameover" : ""}>
                <td>{g.game_id}</td>
                <td>{formatAddress(g.player1)}</td>
                <td>{formatAddress(g.player2)}</td>
                <td>
                  <Link to={`/games/${g.game_id}`}>
                    {g.status ? g.status : `${g.turn_color} to play`}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="status">
          No games yet. <Link to="/challenges">Find or Create a Challenge</Link>
        </p>
      )}
    </>
  );
}
