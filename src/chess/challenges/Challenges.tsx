import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

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
    status?: string;
  }>({});

  useEffect(() => {
    loadChallenges();
  }, [contract.address]);

  async function loadChallenges(): Promise<void> {
    setState({ ...state, status: "Loading challenges" });
    return contract
      .getChallenges()
      .then((challenges: Challenge[]) => {
        setState({ ...state, challenges, status: undefined });
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
          {state.status ? <p className="status">{`${state.status}`}</p> : <></>}

          {state.challenges && state.challenges.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Play As</th>
                  <th>Created By</th>
                  <th>Opponent</th>
                </tr>
              </thead>
              <tbody>
                {state.challenges.map((c, key) => (
                  <tr key={key}>
                    <td>{c.challenge_id}</td>
                    <td>{c.play_as || "random"}</td>
                    <td>{contract.client.formatAddress(c.created_by)}</td>
                    <td>{contract.client.formatAddress(c.opponent)}</td>
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
            <p className="status">No challenges yet</p>
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
