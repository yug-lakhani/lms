import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/clodinary.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";


const app = express();

// Connect to Database
await connectDB();
await connectCloudinary();

//Middlewares
app.use(cors());
app.use(clerkMiddleware())


// 👇 Raw body ONLY for Clerk webhooks
app.post("/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// Other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/educator',express.json(),educatorRouter)
app.use('/api/course',express.json(),courseRouter)
app.use('/api/user',express.json(),userRouter)
app.get("/", (req, res) => res.send("API working"));
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));