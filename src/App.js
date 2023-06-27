import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import GameEdit from "./pages/GameEdit";
import GameIndex from "./pages/GameIndex";
import GameNew from "./pages/GameNew";
import GameShow from "./pages/GameShow";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import AboutUs from "./pages/AboutUs";
import "./App.css";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);

  const url = "http://localhost:3000";

  useEffect(() => {
    const loggedInUser = localStorage.getItem("token");

    if (loggedInUser) {
      const authUserId = +JSON.parse(atob(loggedInUser?.split(".")[1])).sub;
      setCurrentUser({ id: authUserId });
    }

    readGames();
  }, []);

  const readGames = () => {
    fetch(`${url}/games`)
      .then((response) => response.json())
      .then((payload) => {
        setGames(payload);
      })
      
  };

  const createGame = (game) => {
    fetch(`${url}/games`, {
      body: JSON.stringify({ game }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then((response) => response.json())
      .then((payload) => {
        setGames([...games, payload]); // Update the list of games
      })
      
  };

  const updateGame = (updatedGame) => {
    fetch(`${url}/games/${updatedGame.id}`, {
      method: "PATCH", // or "PUT"
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedGame),
    })
      .then((response) => response.json())
      .then((payload) => {
        const updatedGames = games.map((game) =>
          game.id === payload.id ? payload : game
        );
        setGames(updatedGames);
      })
   
  };

  const deleteGame = (id) => {
    fetch(`${url}/games/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          const updatedGames = games.filter((game) => game.id !== id);
          setGames(updatedGames);
        } else {
          throw new Error("Game deletion error");
        }
      })
      .catch((error) => console.log("Game deletion error:", error));
  };

  const login = (userInfo) => {
    fetch(`${url}/login`, {
      body: JSON.stringify(userInfo),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        localStorage.setItem("token", response.headers.get("Authorization"));
        return response.json();
      })
      .then((payload) => {
        setCurrentUser(payload);
      })
     
  };

  const logout = () => {
    fetch(`${url}/logout`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"), //retrieve the token
      },
      method: "GET",
    })
      .then((payload) => {
        localStorage.removeItem("token"); // remove the token
        setCurrentUser(null);
      })
      
  };

  const signup = (userInfo) => {
    fetch(`${url}/signup`, {
      body: JSON.stringify(userInfo),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        // store the token
        localStorage.setItem("token", response.headers.get("Authorization"));
        return response.json();
      })
      .then((payload) => {
        setCurrentUser(payload);
      })
      
  };

  return (
    <>
      <Header currentUser={currentUser} logout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/gameindex"
          element={<GameIndex games={games} deleteGame={deleteGame} />}
        />
        <Route
          path="/gameshow/:id"
          element={<GameShow games={games} deleteGame={deleteGame} />}
        />
        <Route
          path="/gamenew"
          element={
            <GameNew createGame={createGame} currentUser={currentUser} />
          }
        />
        <Route
          path="/gameedit/:id"
          element={
            <GameEdit
              games={games}
              updateGame={updateGame}
              currentUser={currentUser}
              deleteGame={deleteGame}
            />
          }
        />
        <Route path="/signup" element={<SignUp signup={signup} />} />
        <Route path="/login" element={<LogIn login={login} />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
