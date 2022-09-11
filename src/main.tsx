import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "./App";
import { Challenges } from "./chess/challenges/Challenges";
import { Game } from "./chess/game/Game";
import { Games } from "./chess/games/Games";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
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
  </StrictMode>
);
