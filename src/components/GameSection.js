import React from 'react';

const GameSection = ({ socket, players, question, datetime }) => {
    const submitAnswer = (answer) => {
        if (question) {
            socket.emit("answer", { answer, questionId: question.questionId });
        }
    };

    return (
        <div>
            <div id="dateTime" style={{ position: 'absolute', top: 10, right: 10 }}>
                {datetime}
            </div>
            <h2>Joueurs connectés: {players.map(p => p.name).join(", ")}</h2>
            {question && (
                <div>
                    <h3>{question.question}</h3>
                    <button onClick={() => submitAnswer(true)}>Vrai</button>
                    <button onClick={() => submitAnswer(false)}>Faux</button>
                </div>
            )}
        </div>
    );
};

export default GameSection;
