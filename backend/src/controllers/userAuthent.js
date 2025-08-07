const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")


const register = async (req,res)=>{
    
    try{
        // validate the data;
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);

      req.body.role = 'user'
      // Remove explicit setting of problemSolved since it has a default value

       
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
     const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role:user.role,
    }
    
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).json({
        user:reply,
        message:"Registration Successful"
    })
    }
    catch(err){
        console.log("Error in registration: ", err);
        
        // Handle specific error cases
        if (err.code === 11000) {
            return res.status(400).json({
                message: "Email already exists. Please use a different email."
            });
        }
        
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: "Please check your input data and try again."
            });
        }
        
        // Check if it's a database connection error
        if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
            return res.status(503).json({
                message: "Database connection error. Please try again later."
            });
        }
        
        res.status(400).json({
            message: err.message || "Registration failed. Please try again."
        });
    }
}


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            return res.status(400).json({ message: "Email is required" });
        if(!password)
            return res.status(400).json({ message: "Password is required" });

        const user = await User.findOne({emailId});

        if(!user)
            return res.status(401).json({ message: "Invalid email or password" });

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            return res.status(401).json({ message: "Invalid email or password" });

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(200).json({
            user:reply,
            message:"Login Successful"
        })
    }
    catch(err){
        console.log("Error in login: ", err);
        
        // Check if it's a database connection error
        if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
            return res.status(503).json({
                message: "Database connection error. Please try again later."
            });
        }
        
        res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
}


// logOut feature

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        // Try to add token to Redis blocklist, but don't fail if Redis is unavailable
        try {
            await redisClient.set(`token:${token}`,'Blocked');
            await redisClient.expireAt(`token:${token}`,payload.exp);
        } catch (redisError) {
            console.log("Redis not available, skipping token blocklist update");
        }
        
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena.....

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(503).send("Error: "+err);
    }
}


const adminRegister = async(req,res)=>{
    try{
        // validate the data;
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'admin'; // Set role to admin
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).json({
        user: {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        },
        message: "Admin Registered Successfully"
    });
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;
      
    // userSchema delete
    await User.findByIdAndDelete(userId);

    // Submission se bhi delete karo...
    
    // await Submission.deleteMany({userId});
    
    res.status(200).send("Deleted Successfully");

    }
    catch(err){
      
        res.status(500).send("Internal Server Error");
    }
}


module.exports = {register, login,logout,adminRegister,deleteProfile};