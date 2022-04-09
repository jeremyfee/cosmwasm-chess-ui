import { useOutletContext } from "react-router";
import { Link } from "react-router-dom";
import { Address } from "../../Address";
import {
  ChessGameSummary,
  CosmWasmChess,
  formatGameSummaryStatus,
} from "../CosmWasmChess";
import "./GameSummary.css";

export interface GameSummaryProps {
  game: ChessGameSummary;
}

export function GameSummary(props: GameSummaryProps) {
  const { game: g } = props;
  const contract = useOutletContext<CosmWasmChess>();
  const address = contract.address;

  return (
    <Link
      className={"gameSummary" + (g.status ? "gameover" : "")}
      to={`/games/${g.game_id}`}
    >
      <div className="players">
        <p className="game_id">
          <strong>#{g.game_id}</strong>
        </p>
        <p className="player1">
          <small>White</small>
          <br />
          <span className="player">
            {address === g.player1 ? "you" : <Address address={g.player1} />}
          </span>
        </p>
        <p className="opponent">
          <small>Black</small>
          <br />
          <span className="player">
            {address === g.player2 ? "you" : <Address address={g.player2} />}
          </span>
        </p>
      </div>

      <div className="actions">
        {formatGameSummaryStatus(g.status, g.turn_color)}
        {g.status
          ? ""
          : (address === g.player1 && g.turn_color === "white") ||
            (address === g.player2 && g.turn_color === "black")
          ? "(Your Move)"
          : ""}
      </div>
    </Link>
  );
}
