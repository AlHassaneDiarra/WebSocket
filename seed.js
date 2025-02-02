// Exemple de code pour ajouter des questions dans MongoDB
const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/quizgame', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connecté à MongoDB');
    // Ajoutez des questions ici
    const questions = [
        { question: "La terre est-elle ronde ?", answer: true },
        { question: "Le soleil se lève à l'ouest ?", answer: false },
        { question: "L'eau gèle à 0 degrés Celsius ?", answer: true }
    ];

    Question.insertMany(questions)
        .then(() => {
            console.log('Questions ajoutées avec succès');
            mongoose.connection.close();
        })
        .catch(err => {
            console.error('Erreur lors de l\'ajout des questions:', err);
            mongoose.connection.close();
        });
})
.catch((err) => console.error('Erreur de connexion à MongoDB:', err));
