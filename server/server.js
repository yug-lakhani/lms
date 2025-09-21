import express from 'express'
 import cors from 'cors'
 import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'
import bodyParser from 'body-parser'

 //initialize express
 const app = express()

 // connect to database
 await connectDB()

 //middlewares
    app.use(cors())
    app.use(express.json())


 //Routes
 app.get('/', (req, res) => res.send("API working"))

 app.post("/clerk", 
  bodyParser.raw({ type: "application/json" }),
  clerkWebhooks
);



 //Port
 const PORT = process.env.PORT || 5000
 app.listen(PORT, () => console.log(`Server running on port ${PORT}`))