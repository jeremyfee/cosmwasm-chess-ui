import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { Link } from "react-router-dom";

import {
  Challenge,
  CosmWasmChess,
  CreateChallengeProps,
} from "../CosmWasmChess";
import "./Challenges.css";
import { CreateChallenge } from "./CreateChallenge";

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

  function formatAddress(address?: string) {
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
      <h2>Challenges</h2>

      <div className="challenges-wrapper">
        <div className="challenges">
          {state.error ? <p className="error">{`${state.error}`}</p> : <></>}
          {state.status ? <p className="status">{state.status}</p> : <></>}

          {state.challenges && state.challenges.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th className="id">ID</th>
                  <th className="play_as">Play As</th>
                  <th className="created_by">Created By</th>
                  <th className="opponent">Opponent</th>
                  <th className="actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.challenges.map((c, key) => (
                  <tr key={key}>
                    <td className="id">{c.challenge_id}</td>
                    <td className="play_as">{c.play_as || "random"}</td>
                    <td className="created_by">
                      {formatAddress(c.created_by)}
                    </td>
                    <td className="opponent">{formatAddress(c.opponent)}</td>
                    <td>
                      {c.created_by === contract.address ? (
                        <button
                          onClick={() => onCancelChallenge(c.challenge_id)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          disabled={!contract.address}
                          onClick={() => onAcceptChallenge(c.challenge_id)}
                        >
                          Accept
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <></>
          )}
        </div>

        <CreateChallenge
          disabled={!contract.address}
          onCreateChallenge={onCreateChallenge}
        />
      </div>
    </>
  );
}
