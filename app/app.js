const dotenv = require("dotenv");
const path = require("path");
const envFilePath = path.resolve(__dirname, '..', `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`);
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const { connectDB } = require("../config/db");
dotenv.config({ path: envFilePath });
const app = express();

const DB_URL = process.env.MONGO_URL;

console.log(DB_URL);
// Connection check with db
connectDB(DB_URL);
app.use(
    cors({
        origin: "*",
    })
);
// Body parser middleware
app.use(express.json({ extended: false }));
app.use(logger('dev'));

app.get("/", (req, res) => res.send("API running"));
const BASE_URL = "/api/v1";
// Define Routes
app.use(`${BASE_URL}/auth`, require("../routes/auth"));
app.use(`${BASE_URL}/user`, require("../routes/user"));
app.use(`${BASE_URL}/guess`, require("../routes/guessHistory"));

module.exports = app;
