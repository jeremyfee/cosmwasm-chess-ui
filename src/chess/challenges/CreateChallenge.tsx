import React, { useState } from "react";

import { CreateChallengeProps as CreateChallengeState } from "../CosmWasmChess";
import "./CreateChallenge.css";

export interface CreateChallengeProps {
  disabled?: boolean;
  onCreateChallenge: (challenge: CreateChallengeState) => void;
}

export function CreateChallenge(props: CreateChallengeProps) {
  const [state, setState] = useState<CreateChallengeState>({});

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setState((state) => {
      return { ...state, [e.target.name]: e.target.value };
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onCreateChallenge({
      block_time_limit: state.block_time_limit || undefined,
      opponent: state.opponent || undefined,
      play_as: state.play_as || undefined,
    });
    setState((state) => {
      return {};
    });
  };

  return (
    <div className="createChallenge">
      <h4>Create Challenge</h4>
      <form onSubmit={onSubmit}>
        <label htmlFor="create_challenge_play_as">Play As</label>
        <select
          id="create_challenge_play_as"
          name="play_as"
          onChange={onChange}
          value={state.play_as}
        >
          <option value="">Random</option>
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>

        <label htmlFor="create_challenge_opponent">Opponent Address</label>
        <input
          id="create_challenge_opponent"
          name="opponent"
          onChange={onChange}
          placeholder="optional"
          type="text"
          value={state.opponent}
        />

        {/* <label htmlFor="create_challenge_block_time_limit">
          Block Time Limit
        </label>
        <input
          id="create_challenge_block_time_limit"
          name="block_time_limit"
          onChange={onChange}
          type="number"
          min="0"
          value={state.block_time_limit}
        /> */}

        <button disabled={props.disabled}>Create Challenge</button>
      </form>
    </div>
  );
}
