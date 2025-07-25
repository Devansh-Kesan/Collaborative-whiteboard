const mongoose = require("mongoose");
require("dotenv").config();

const username = encodeURIComponent(process.env.MONGO_USERNAME);
const password = encodeURIComponent(process.env.MONGO_PASSWORD);

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${username}:${password}@cluster-0.f4k8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-0`, {
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
