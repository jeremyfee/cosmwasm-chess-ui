import { ReactNode, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import { ChessGameSummary, CosmWasmChess } from "../CosmWasmChess";
import "./Games.css";
import { GameSummary } from "./GameSummary";

export function Games() {
  const contract = useOutletContext<CosmWasmChess>();
  const [state, setState] = useState<{
    games?: ChessGameSummary[];
    status?: ReactNode;
    error?: unknown;
  }>({});

  useEffect(() => {
    loadGames();
  }, []); // no filtering based on address yet [contract.address]);

  async function loadGames(): Promise<void> {
    setState({ ...state, status: "Loading games" });
    return contract
      .getGames({
        // worry about filtering once there are too many games
        /* player: contract.address */
      })
      .then((games: ChessGameSummary[]) => {
        // sort player games first, then by game id desc (newer first)
        const address = contract.address || "none";
        games.sort((a, b) => {
          const in_a = address === a.player1 || address === a.player2;
          const in_b = address === b.player1 || address === b.player2;
          if (in_a && !in_b) {
            return -1;
          } else if (!in_a && in_b) {
            return 1;
          } else {
            return a.game_id > b.game_id ? -1 : 1;
          }
        });
        return games;
      })
      .then((games: ChessGameSummary[]) => {
        setState((state) => {
          let status: ReactNode | undefined = undefined;
          if (games.length === 0) {
            status = (
              <>
                No games yet,{" "}
                <Link to="/challenges">find or create a challenge</Link>
              </>
            );
          }
          return { ...state, games, status };
        });
      })
      .catch((error: any) => {
        setState((stat) => {
          return { ...state, error, status: undefined };
        });
      });
  }

  return (
    <div className="games-wrapper">
      <div className="games">
        <h2>Games</h2>
        {state.error ? <p className="error">{`${state.error}`}</p> : <></>}
        {state.status ? <p className="status">{state.status}</p> : <></>}

        {state.games && state.games.length > 0 ? (
          state.games.map((game) => (
            <GameSummary game={game} key={game.game_id} />
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
