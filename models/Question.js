// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: Boolean, required: true }
});

module.exports = mongoose.model('Question', questionSchema);
