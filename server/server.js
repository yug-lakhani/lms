import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

const app = express();

// Connect to MongoDB
await connectDB();

// Enable CORS globally
app.use(cors());

// ---------------------------
// WEBHOOK ROUTE (Clerk / Svix)
// ---------------------------
// Use raw body for signature verification
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// ---------------------------
// Other routes
// ---------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("API working"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ---------------------------
// Vercel: Disable default body parsing
// ---------------------------
export const config = {
  api: {
    bodyParser: false,
  },
};
