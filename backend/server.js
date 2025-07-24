const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");

const connectToDB = require('./config/db');
const Canvas = require("./models/canvasModel");

const userRoutes = require("./routes/userRoutes");
const canvasRoutes = require("./routes/canvasRoutes");

const SECRET_KEY = process.env.SECRET_KEY || "my_secret_key";
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/canvas", canvasRoutes);

connectToDB();

const server = http.createServer(app);


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
