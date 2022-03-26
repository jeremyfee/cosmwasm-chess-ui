import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "./App";
import { Challenges } from "./chess/challenges/Challenges";
import { Game } from "./chess/game/Game";
import { Games } from "./chess/games/Games";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="challenges" element={<Challenges />} />
          <Route path="games">
            <Route path=":game_id" element={<Game />} />
            <Route index element={<Games />} />
          </Route>
          <Route index element={<Navigate to="/games" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
