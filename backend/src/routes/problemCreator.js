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
    const { submitBatch } = require("../utils/problemUtility");
    
    // Simple test submission
    const testSubmission = [{
      source_code: "print('Hello, World!')",
      language_id: 63, // JavaScript
      stdin: "",
      expected_output: "Hello, World!"
    }];
    
    const result = await submitBatch(testSubmission);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem", getAllProblem); // Removed userMiddleware to allow public access
problemRouter.get("/problemSolvedByUser",userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);


module.exports = problemRouter;

// fetch
// update
// delete 
