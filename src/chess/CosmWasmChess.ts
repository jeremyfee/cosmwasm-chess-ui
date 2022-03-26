import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { CosmWasm } from "./useCosmWasm";

export interface Challenge {
  block_time_limit?: number;
  challenge_id: number;
  created_block: number;
  created_by: string;
  opponent?: string;
  play_as?: "white" | "black";
}

export interface CreateChallengeProps {
  block_time_limit?: number;
  opponent?: string;
  play_as?: "white" | "black";
}

export interface MakeMove {
  make_move: string;
}

export interface OfferDraw {
  offer_draw: string;
}

export function isMakeMove(value: MoveAction): value is MakeMove {
  return value.hasOwnProperty("make_move");
}

export function isOfferDraw(value: MoveAction): value is OfferDraw {
  return value.hasOwnProperty("offer_draw");
}

export type MoveAction = "accept_draw" | MakeMove | OfferDraw | "resign";

export interface Move {
  action: MoveAction;
  block: number;
}

export interface ChessGame {
  block_time_limit?: number;
  game_id: number;
  moves: Move[];
  player1: string;
  player2: string;
  status?: string;
  start_height: number;
  turn_color?: "white" | "black";
}

export interface ChessGameSummary {
  block_time_limit?: number;
  game_id: number;
  player1: string;
  player2: string;
  status?: string;
  start_height: number;
  turn_color?: "white" | "black";
}

export class CosmWasmChess {
  constructor(public client: CosmWasm, public readonly contract: string) {}

  async acceptChallenge(challenge_id: number): Promise<ExecuteResult> {
    return this.client.execute(this.contract, {
      accept_challenge: { challenge_id },
    });
  }

  async acceptDraw(game_id: number): Promise<ExecuteResult> {
    return this.client.execute(this.contract, {
      move: { action: "accept_draw", game_id },
    });
  }

  get address() {
    return this.client.address;
  }

  async cancelChallenge(challenge_id: number): Promise<ExecuteResult> {
    return this.client.execute(this.contract, {
      cancel_challenge: { challenge_id },
    });
  }

  async createChallenge(data: CreateChallengeProps): Promise<ExecuteResult> {
    return this.client.execute(this.contract, { create_challenge: data });
  }

  async getChallenges(player?: string): Promise<Challenge[]> {
    return this.client.queryContractSmart(this.contract, {
      get_challenges: { player: player },
    });
  }

  async getGame(game_id: number): Promise<ChessGame> {
    return this.client.queryContractSmart(this.contract, {
      get_game: { game_id },
    });
  }

  async getGames(
    player?: string,
    game_over?: boolean
  ): Promise<ChessGameSummary[]> {
    return this.client.queryContractSmart(this.contract, {
      get_games: { game_over: game_over ?? !!player, player },
    });
  }

  async makeMove(game_id: number, make_move: string): Promise<ExecuteResult> {
    return this.client.execute(this.contract, {
      move: { action: { make_move }, game_id },
    });
  }

  async offerDraw(game_id: number, offer_draw: string): Promise<ExecuteResult> {
    return this.client.execute(this.contract, {
      move: { action: { offer_draw }, game_id },
    });
  }

  async resign(game_id: number): Promise<ExecuteResult> {
    return this.client.execute(this.contract, {
      move: { action: "resign", game_id },
    });
  }
}
