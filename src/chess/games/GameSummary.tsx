import { Link } from "react-router-dom";
import { ChessGameSummary, formatGameSummaryStatus } from "../CosmWasmChess";
import "./GameSummary.css";

export interface GameSummaryProps {
  address?: string;
  game: ChessGameSummary;
  formatAddress: (address?: string) => string | undefined;
}

export function GameSummary(props: GameSummaryProps) {
  const { address, game: g, formatAddress } = props;

  return (
    <section className={"gameSummary" + (g.status ? "gameover" : "")}>
      <div className="players">
        <p className="game_id">
          <strong>#{g.game_id}</strong>
        </p>
        <p className="player1">
          <small>White</small>
          <br />
          <span className="player">{formatAddress(g.player1)}</span>
        </p>
        <p className="opponent">
          <small>Black</small>
          <br />
          <span className="player">{formatAddress(g.player2)}</span>
        </p>
      </div>

      <div className="actions">
        <Link to={`/games/${g.game_id}`}>
          {formatGameSummaryStatus(g.status, g.turn_color)}
        </Link>
        {g.status
          ? ""
          : (address === g.player1 && g.turn_color === "white") ||
            (address === g.player2 && g.turn_color === "black")
          ? "(Your Move)"
          : ""}
      </div>
    </section>
  );
}
