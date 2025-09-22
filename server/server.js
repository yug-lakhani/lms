import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

const app = express();
await connectDB();

app.use(cors());

// 👇 Raw body ONLY for Clerk webhooks
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// Other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("API working"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
