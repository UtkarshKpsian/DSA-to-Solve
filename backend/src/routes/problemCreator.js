const express = require('express');

const problemRouter =  express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem} = require("../controllers/userProblem");
const userMiddleware = require("../middleware/userMiddleware");


// Create
problemRouter.post("/create",adminMiddleware ,createProblem);
problemRouter.put("/update/:id",adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware, deleteProblem);

// Test Judge0 API connection
problemRouter.get("/test-judge0", async (req, res) => {
  try {
    const { testJudge0Connection } = require("../utils/problemUtility");
    
    const isWorking = await testJudge0Connection();
    if (isWorking) {
      res.json({ success: true, message: "Judge0 API is working correctly" });
    } else {
      res.status(500).json({ success: false, message: "Judge0 API test failed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/problemById/:id/admin",adminMiddleware,getProblemById); // Admin route for getting problem details
problemRouter.get("/getAllProblem", getAllProblem); // Removed userMiddleware to allow public access
problemRouter.get("/problemSolvedByUser",userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);


module.exports = problemRouter;

// fetch
// update
// delete 
