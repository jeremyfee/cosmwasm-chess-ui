import { Challenge } from "../CosmWasmChess";
import "./ChallengeSummary.css";

export interface ChallengeElProps {
  address?: string;
  challenge: Challenge;
  formatAddress: (address?: string) => string | undefined;
  onAcceptChallenge: (id: number) => void;
  onCancelChallenge: (id: number) => void;
}

export function ChallengeSummary(props: ChallengeElProps) {
  const {
    address,
    challenge: c,
    formatAddress,
    onAcceptChallenge,
    onCancelChallenge,
  } = props;

  const player_color = c.play_as || "random color";
  const opponent_color =
    player_color === "white"
      ? "black"
      : player_color === "black"
      ? "white"
      : player_color;

  return (
    <section className="challengeSummary">
      <div className="players">
        <p className="challenge_id">
          <strong>#{c.challenge_id}</strong>
        </p>
        <p className="created_by">
          <small>Created By ({player_color})</small>
          <br />
          <span className="player">{formatAddress(c.created_by)}</span>
        </p>
        <p className="opponent">
          <small>Opponent ({opponent_color})</small>
          <br />
          <span className="player">{formatAddress(c.opponent || "open")}</span>
        </p>
      </div>

      <div className="actions">
        {c.created_by === address ? (
          <button
            disabled={c.created_by !== address}
            onClick={() => onCancelChallenge(c.challenge_id)}
          >
            Cancel
          </button>
        ) : (
          <button
            disabled={!address}
            onClick={() => onAcceptChallenge(c.challenge_id)}
          >
            Accept
          </button>
        )}
      </div>
    </section>
  );
}
