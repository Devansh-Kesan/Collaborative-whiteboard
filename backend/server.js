const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const connectToDB = require('./config/db')
const { Server } = require("socket.io");
const http = require("http");
const Canvas = require("./models/canvasModel");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";


const userRoutes = require("./routes/userRoutes");
const canvasRoutes = require("./routes/canvasRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/canvas", canvasRoutes);


connectToDB();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"], 
      methods: ["GET", "POST"],
    },
  });

let canvasData = {};
let loadingCanvases = new Set(); // Track canvases being loaded

// let i = 0;
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
  
    socket.on("joinCanvas", async ({ canvasId }) => {
        console.log("Joining canvas:", canvasId);
        try {
            const authHeader = socket.handshake.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.log("No token provided.");
                socket.emit("unauthorized", { message: "Access Denied: No Token" });
                return;
            }

            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, SECRET_KEY);
            const userId = decoded.userId;

            // Leave previous canvas room if any
            if (socket.currentCanvas) {
                socket.leave(socket.currentCanvas);
            }

            // const canvas = await Canvas.findById(canvasId);
            // if (!canvas || (String(canvas.owner) !== String(userId) && !canvas.shared.includes(userId))) {
            //     socket.emit("unauthorized", { message: "You are not authorized to join this canvas." });
            //     return;
            // }

            
            // // Update in-memory state with database state
            // canvasData[canvasId] = canvas.elements || [];

            // Store current canvas id in socket
            socket.currentCanvas = canvasId;
            socket.join(canvasId);

            // Add to loading set
            loadingCanvases.add(canvasId);
            
            // Load canvas data
            const canvas = await Canvas.findById(canvasId);
            if (!canvasData[canvasId]) {
                canvasData[canvasId] = canvas.elements || [];
            }
            
            socket.emit(`loadCanvas_${canvasId}`, canvasData[canvasId]);
            
            // Remove from loading set
            loadingCanvases.delete(canvasId);
        } catch (error) {
            loadingCanvases.delete(canvasId);
            socket.emit(`unauthorized_${canvasId}`, { 
                message: "An error occurred while joining the canvas." 
            });
        }
    });

    //////////
    // Add new event for canvas sharing
    socket.on("canvasShared", ({ recipientId }) => {
        // Emit event to recipient to update their canvas list
        socket.broadcast.emit(`canvasListUpdate_${recipientId}`);
    });

    //////////

    socket.on("drawingUpdate", async ({ canvasId, elements }) => {
        try {
            if (!elements || !canvasId) return;
            
            // If canvas is still loading, queue the update
            if (loadingCanvases.has(canvasId)) {
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait for load
            }
            
            // Merge with existing elements if necessary
            const currentElements = canvasData[canvasId] || [];
            const updatedElements = elements;
            
            canvasData[canvasId] = updatedElements;
            socket.to(canvasId).emit(`receiveDrawingUpdate_${canvasId}`, updatedElements);
            
            // Save to database
            await Canvas.findByIdAndUpdate(canvasId, { elements: updatedElements });
        } catch (error) {
            console.error('Drawing update error:', error);
        }
    });
    
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // Clean up when user disconnects
        if (socket.currentCanvas) {
            socket.leave(socket.currentCanvas);
        }
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));