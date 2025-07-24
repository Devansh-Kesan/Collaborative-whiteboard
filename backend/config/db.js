const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://Devansh_whiteboard:falcon__123@cluster-0.f4k8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-0", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            

        });
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
