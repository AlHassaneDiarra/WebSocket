// routes/index.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send({ response: "Je suis en ligne" }).status(200);
});

module.exports = router;
