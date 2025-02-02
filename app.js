const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require('mongoose');
const cors = require("cors");
const Question = require("./models/Question");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(index);

mongoose.connect('mongodb://localhost:27017/quizgame', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB'))
.catch((err) => console.error('Erreur de connexion à MongoDB:', err));

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let interval;
let players = [];
let questionId; // Pour stocker l'ID de la question actuelle

io.on("connection", (socket) => {
    console.log("Nouveau joueur connecté", socket.id);

    socket.on("register", async (name) => {
        if (name) {
            players.push({ id: socket.id, name, responseTime: null });

            // Vérifiez si deux joueurs sont connectés
            if (players.length === 2) {
                io.emit("startGame", players);
                await startGame(); // Démarrer le jeu lorsque deux joueurs sont connectés
            }
        }
    });

    socket.on("answer", async ({ answer, questionId: receivedQuestionId }) => {
        const player = players.find(p => p.id === socket.id);
        
        if (player) {
            const question = await Question.findById(receivedQuestionId);
            const isCorrect = answer === question.answer;

            // Enregistrer le temps de réponse
            const responseTime = Date.now() - player.startTime; // Temps écoulé depuis que la question a été envoyée
            player.responseTime = responseTime; // Sauvegarder le temps de réponse

            // Vérifiez si tous les joueurs ont répondu
            const allResponded = players.every(p => p.responseTime !== null);

            if (allResponded) {
                const fastestPlayer = players.reduce((prev, curr) => 
                    (prev.responseTime < curr.responseTime ? prev : curr)
                );

                io.emit("result", {
                    isCorrect,
                    player: player.name,
                    fastestPlayer: fastestPlayer.name,
                    responseTime: fastestPlayer.responseTime,
                    correctAnswer: question.answer
                });

                // Réinitialiser les temps de réponse pour la prochaine question
                players.forEach(p => p.responseTime = null);

                // Vérifier si toutes les questions ont été posées
                const questions = await Question.find();
                if (questions.length === 0) {
                    io.emit("gameOver");
                } else {
                    await startGame(); // Démarrer une nouvelle question
                }
            }
        }
    });

    // Ne pas oublier d'arrêter l'intervalle lorsque le jeu se termine ou qu'un joueur se déconnecte
    socket.on("disconnect", () => {
        console.log("Joueur déconnecté", socket.id);
        players = players.filter(player => player.id !== socket.id);
        
        // Arrêtez l'intervalle si aucun joueur n'est connecté
        if (players.length < 1) {
            clearInterval(interval);
        }
    });
});

// Fonction pour démarrer le jeu et envoyer une question
const startGame = async () => {
    const questions = await Question.find();
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionId = randomQuestion._id; // Stocker l'ID de la question actuelle

    // Envoyer la question aux joueurs
    io.emit("newQuestion", {
        question: randomQuestion.question,
        questionId: randomQuestion._id
    });

    // Émettre l'heure actuelle à intervalles réguliers
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => {
        const currentDateTime = new Date().toLocaleString();
        io.emit("updateDateTime", currentDateTime);
    }, 1000);

    // Initialiser le temps de réponse pour chaque joueur
    players.forEach(player => {
        player.startTime = Date.now(); // Enregistrer le moment où la question est envoyée
        player.responseTime = null; // Réinitialiser le temps de réponse
    });
};

server.listen(port, () => console.log(`Serveur démarré sur le port ${port}`));
