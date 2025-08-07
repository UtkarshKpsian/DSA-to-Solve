const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const aiRouter = require("./routes/aiChatting")
const videoRouter = require("./routes/videoCreator");
const cors = require("cors");

// Check for required environment variables
if (!process.env.JWT_KEY) {
    console.warn("Warning: JWT_KEY environment variable is not set. Using default key for development.");
    process.env.JWT_KEY = "default-jwt-secret-key-for-development-only";
}

app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));


app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

const InitalizeConnection = async ()=>{
    try{
        // Try to connect to MongoDB, but don't fail if it's not available
        try {
            await main();
        } catch (dbError) {
            console.log("MongoDB connection failed, continuing without database:", dbError.message);
        }
        
        // Skip Redis connection entirely for now to avoid connection errors
        console.log("Skipping Redis connection for development");
        
        // Start the server regardless of database connections
        const port = process.env.PORT || 3000;
        app.listen(port, ()=>{
            console.log("Server listening at port number: " + port);
        })

    }
    catch(err){
        console.log("Server startup error:", err);
    }
}


InitalizeConnection();

