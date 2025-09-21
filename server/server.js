import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import bodyParser from "body-parser";

const app = express();

// connect to database
await connectDB();

// CORS can be global
app.use(cors());



// IMPORTANT: use raw body parser only for the webhook route

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/clerk", bodyParser.raw({ type: "application/json" }), clerkWebhooks);


// Your other routes
app.get("/", (req, res) => res.send("API working"));

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
