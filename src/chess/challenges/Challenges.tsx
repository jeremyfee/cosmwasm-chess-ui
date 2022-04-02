import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { Link } from "react-router-dom";

import {
  Challenge,
  CosmWasmChess,
  CreateChallengeProps,
} from "../CosmWasmChess";
import { ChallengeSummary } from "./ChallengeSummary";
import { CreateChallenge } from "./CreateChallenge";
import "./Challenges.css";

export function Challenges() {
  let navigate = useNavigate();
  const contract = useOutletContext<CosmWasmChess>();

  const [state, setState] = useState<{
    challenges?: Challenge[];
    error?: unknown;
    status?: ReactNode;
  }>({});

  useEffect(() => {
    loadChallenges();
  }, [contract.address]);

  function formatAddress(address?: string): string | undefined {
    if (contract.address && contract.address === address) {
      return "You";
    } else {
      return address;
    }
  }

  async function loadChallenges(): Promise<void> {
    setState({ ...state, status: "Loading challenges" });
    return contract
      .getChallenges({})
      .then((challenges: Challenge[]) => {
        // sort player challenges first, then by game id desc (newer first)
        const address = contract.address || "none";
        challenges.sort((a, b) => {
          const in_a = address in [a.created_by, a.opponent];
          const in_b = address in [b.created_by, b.opponent];
          if (in_a && !in_b) {
            return -1;
          } else if (!in_a && in_b) {
            return 1;
          } else {
            return a.challenge_id > b.challenge_id ? -1 : 1;
          }
        });
        return challenges;
      })
      .then((challenges: Challenge[]) => {
        let status: ReactNode | undefined = undefined;
        if (challenges.length === 0) {
          status = (
            <>
              No challenges yet, create a challenge or{" "}
              <Link to="/games">check games</Link>
            </>
          );
        }
        setState({ ...state, challenges, status });
      })
      .catch((error: any) => {
        setState({ ...state, error, status: undefined });
      });
  }

  async function onAcceptChallenge(id: number): Promise<void> {
    setStatus(`Executing Accept Challenge (${id})`);
    return contract
      .acceptChallenge(id)
      .then(() => {
        // load games
        navigate("/games");
      })
      .catch(setError);
  }

  async function onCancelChallenge(id: number): Promise<void> {
    setStatus(`Executing Cancel Challenge (${id})`);
    return contract.cancelChallenge(id).then(loadChallenges).catch(setError);
  }

  async function onCreateChallenge(challenge: CreateChallengeProps) {
    return contract
      .createChallenge(challenge)
      .then(loadChallenges)
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

  return (
    <>
      <div className="challenges-wrapper">
        <div className="challenges">
          <h2>Challenges</h2>
          {state.error ? <p className="error">{`${state.error}`}</p> : <></>}
          {state.status ? <p className="status">{state.status}</p> : <></>}
          {state.challenges && state.challenges.length > 0 ? (
            state.challenges.map((c) => (
              <ChallengeSummary
                challenge={c}
                formatAddress={formatAddress}
                key={c.challenge_id}
                onAcceptChallenge={onAcceptChallenge}
                onCancelChallenge={onCancelChallenge}
              />
            ))
          ) : (
            <></>
          )}
        </div>

        <div className="createChallenge">
          <h3>Create Challenge</h3>
          <CreateChallenge
            disabled={!contract.address}
            onCreateChallenge={onCreateChallenge}
          />
        </div>
      </div>
    </>
  );
}
