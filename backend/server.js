const express = require("express");
const cors = require("cors");

const connectToDB = require('./config/db')

const http = require("http");

const app = express();

app.use(cors());
app.use(express.json());


connectToDB();


const server = http.createServer(app);


server.listen(5000, () => console.log("Server running on port 5000"));