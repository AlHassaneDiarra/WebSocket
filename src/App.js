import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Register from './components/Register'; 
import GameSection from './components/GameSection'; 
import './style.css'; 
const socket = io("http://127.0.0.1:4001");

export default function App() {
    const [players, setPlayers] = useState([]);
    const [question, setQuestion] = useState(null);
    const [datetime, setDatetime] = useState('');
    const [gameStarted, setGameStarted] = useState(false); 

    useEffect(() => {
        socket.on("startGame", (players) => {
            setPlayers(players);
            setGameStarted(true); // Démarrer le jeu lorsque deux joueurs se sont inscrits
        });

        socket.on("newQuestion", (data) => {
            setQuestion(data);
        });

        socket.on("updateDateTime", (currentDateTime) => {
            setDatetime(currentDateTime);
        });

        return () => {
            socket.off("startGame");
            socket.off("newQuestion");
            socket.off("updateDateTime");
        };
    }, []);

    return (
        <div>
            <h1>Jeu Questionnaire</h1>
            {!gameStarted && <Register socket={socket} />} {/* Affiche le formulaire d'inscription uniquement si le jeu n'a pas commencé */}
            {gameStarted && players.length === 2 && <GameSection question={question} players={players} datetime={datetime} />}
        </div>
    );
}