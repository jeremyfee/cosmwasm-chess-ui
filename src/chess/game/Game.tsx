import { StdFee } from "@cosmjs/amino";
import { Chess, ChessInstance, Move } from "chess.js";
import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";

import {
  CosmWasmChess,
  ChessGame,
  isMakeMove,
  isOfferDraw,
  formatGameSummaryStatus,
} from "../CosmWasmChess";
import { ChessBoard } from "./ChessBoard";
import "./Game.css";

function parseGame(game: ChessGame): ChessInstance {
  const chess = new Chess();
  game.moves.forEach((move) => {
    const action = move[1];
    if (isMakeMove(action)) {
      chess.move(action.move);
    } else if (isOfferDraw(action)) {
      chess.move(action.offer_draw);
    }
  });
  return chess;
}

export function Game() {
  const contract = useOutletContext<CosmWasmChess>();
  const { game_id } = useParams();

  const [state, setState] = useState<{
    // connected wallet address
    address?: string;
    // chess.js game
    chess?: ChessInstance;
    // whether draw was offered on last move
    drawOffered?: boolean;
    // error loading game
    error?: unknown;
    // estimated gas fee
    fee?: number | StdFee | "auto";
    // game from contract
    game?: ChessGame;
    // game history
    history?: Move[];
    // whether player can interact with board
    interactive?: boolean;
    // board orientation
    orientation?: "w" | "b";
    // move that is not yet submitted
    pendingMove?: Move;
    // current status, loading, game over, etc
    status?: string;
    // next turn
    turn?: "w" | "b";
  }>({});

  // update board/controls when address changes
  useEffect(() => {
    setState((state) => {
      return { ...state, address: contract.address };
    });
    updateGame();
  }, [contract.address]);

  // load the game
  useEffect(() => {
    loadGame();
  }, [game_id]);

  function estimateFee(game: ChessGame): number | StdFee | "auto" {
    let gas = "200000";
    let moves = game.moves.length;

    if (moves >= 60) {
      // 0.4.1 crosses 250k around move 80
      gas = "300000";
    } else if (moves >= 20) {
      // 0.4.1 crosses 200k around move 25
      gas = "250000";
    }

    return {
      amount: [],
      gas,
    };
  }

  function formatAddress(address?: string) {
    if (contract.address && contract.address === address) {
      return "You";
    } else {
      return address;
    }
  }

  function formatHistory(history: Move[]) {
    const num_moves = Math.ceil(history.length / 2);
    const move_numbers = Array.from(Array(num_moves).keys());
    return (
      <ol>
        {move_numbers.map((move) => {
          const index = move * 2;
          const white = history[index];
          const black =
            history.length > index + 1 ? history[index + 1] : undefined;
          return (
            <li>
              {white.san} {black ? black.san : ""}
            </li>
          );
        })}
      </ol>
    );
  }

  async function loadGame(): Promise<void> {
    setStatus("Loading Game");
    if (!game_id) {
      return;
    }
    return contract
      .getGame(+game_id)
      .then((game: ChessGame) => {
        setState((state) => {
          return {
            ...state,
            chess: parseGame(game),
            fee: estimateFee(game),
            game,
            status: undefined,
          };
        });
        updateGame();
      })
      .catch(setError);
  }

  async function onAcceptDrawClick(): Promise<void> {
    if (!game_id) {
      return;
    }
    setStatus("Executing Accept Draw");
    return contract
      .acceptDraw(+game_id, state.fee)
      .then(loadGame)
      .catch(setError);
  }

  async function onBoardMove(pendingMove: Move): Promise<void> {
    setState((state) => {
      return { ...state, pendingMove };
    });
    updateGame();
  }

  async function onCancelMoveClick(): Promise<void> {
    setState((state) => {
      return state.game
        ? { ...state, chess: parseGame(state.game), pendingMove: undefined }
        : state;
    });
    updateGame();
  }

  async function onMakeMoveClick(): Promise<void> {
    if (!game_id || !state.pendingMove) {
      return;
    }
    let move = state.pendingMove.san;
    // contract expects zeros
    if (move.indexOf("O") === 0) {
      move = move.replace(/o/gi, "0");
    }
    setStatus(`Executing Move (${move})`);
    return contract
      .makeMove(+game_id, state.pendingMove.san, state.fee)
      .then(loadGame)
      .catch(setError);
  }

  async function onOfferDrawClick(): Promise<void> {
    if (!game_id || !state.pendingMove) {
      return;
    }
    const move = state.pendingMove.san;
    setStatus(`Executing Offer Draw (${move})`);
    return contract
      .offerDraw(+game_id, state.pendingMove.san, state.fee)
      .then(loadGame)
      .catch(setError);
  }

  async function onResignClick(): Promise<void> {
    if (!game_id) {
      return;
    }
    setStatus("Executing Resign");
    return contract
      .resign(+game_id, state.fee)
      .then(loadGame)
      .catch(setError);
  }

  function setError(error: any) {
    setState((state) => {
      return { ...state, error, status: undefined };
    });
  }

  function setStatus(status: string) {
    setState((state) => {
      return { ...state, error: undefined, status };
    });
  }

  function updateGame(): void {
    setState((state) => {
      const { address, chess, game } = state;
      if (!chess || !game) {
        return state;
      }
      // check if draw offered
      let drawOffered = false;
      if (game.moves.length > 0) {
        drawOffered = isOfferDraw(game.moves[game.moves.length - 1][1]);
      }
      const history = chess.history({ verbose: true });
      // check whether current player can make move
      const turn = chess.turn();
      const interactive =
        !game.status &&
        !state.pendingMove &&
        ((turn === "w" && game.player1 === address) ||
          (turn === "b" && game.player2 === address));
      // which way the board should face
      const orientation = address === game.player2 ? "b" : "w";
      // updated state
      return {
        ...state,
        drawOffered,
        history,
        interactive,
        orientation,
        turn,
      };
    });
  }

  return (
    <div className="game-wrapper">
      <div className="game">
        <h2>
          Game {game_id}{" "}
          <small>
            (
            {formatGameSummaryStatus(
              state.game?.status,
              state.turn === "b" ? "black" : "white"
            )}
            )
          </small>
        </h2>

        {state.error ? <p className="error">{`${state.error}`}</p> : ""}
        {state.status ? <p className="status">{state.status}</p> : ""}

        {state.chess ? (
          <div className="board">
            <ChessBoard
              chess={state.chess}
              interactive={state.interactive}
              onMove={onBoardMove}
              orientation={state.orientation}
            />
          </div>
        ) : (
          ""
        )}

        {state.game?.status ? (
          <p className="status">Game over</p>
        ) : (
          <>
            <div className="actions">
              <button
                className="cancel"
                disabled={!state.pendingMove}
                onClick={onCancelMoveClick}
              >
                Cancel
              </button>
              <button
                className="makeMove"
                disabled={!state.pendingMove}
                onClick={onMakeMoveClick}
              >
                Make Move
              </button>
              <button
                className="acceptDraw"
                disabled={!state.drawOffered}
                onClick={onAcceptDrawClick}
              >
                Accept Draw
              </button>
              <button
                className="offerDraw"
                disabled={state.drawOffered || !state.pendingMove}
                onClick={onOfferDrawClick}
              >
                Offer Draw
              </button>
              <button
                className="resign"
                disabled={!state.interactive}
                onClick={onResignClick}
              >
                Resign
              </button>
            </div>
          </>
        )}
      </div>

      <div className="controls">
        <h3>Details</h3>
        <dl>
          <dt>White</dt>
          <dd>{formatAddress(state.game?.player1)}</dd>
          <dt>Black</dt>
          <dd>{formatAddress(state.game?.player2)}</dd>
        </dl>

        <h4>Moves</h4>
        {state.history ? formatHistory(state.history) : <></>}
      </div>
    </div>
  );
}
