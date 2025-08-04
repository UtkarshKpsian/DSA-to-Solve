const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo")

const createProblem = async (req,res)=>{
   
  // API request to authenticate user:
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator
    } = req.body;


    try{
      console.log("Creating problem with data:", {
        title,
        difficulty,
        tags,
        visibleTestCasesCount: visibleTestCases?.length || 0,
        referenceSolutionCount: referenceSolution?.length || 0,
        hasJudge0Key: !!process.env.JUDGE0_KEY
      });
       
      // Check if JUDGE0_KEY is available
      if (!process.env.JUDGE0_KEY) {
        console.log("Warning: JUDGE0_KEY not set, skipping code validation");
      } else if (!referenceSolution || referenceSolution.length === 0) {
        console.log("Warning: No reference solution provided, skipping code validation");
      } else {
        console.log("Starting Judge0 API validation...");
        try {
          // Validate reference solution structure
          if (!Array.isArray(referenceSolution)) {
            throw new Error("Reference solution must be an array");
          }
          
          for(const {language,completeCode} of referenceSolution){
            if (!language || !completeCode) {
              throw new Error("Each reference solution must have language and completeCode fields");
            }
            
            // Skip validation if the code is empty
            if (completeCode.trim() === '') {
              console.log(`Skipping validation for ${language} - code is empty`);
              continue;
            }
            
            // Skip validation if no test cases are provided
            if (!visibleTestCases || visibleTestCases.length === 0) {
              console.log(`Skipping validation for ${language} - no test cases provided`);
              continue;
            }
            
            const languageId = getLanguageById(language);
              
            // Filter out test cases with empty input or output
            const validTestCases = visibleTestCases.filter(testcase => 
              testcase.input && testcase.input.trim() !== '' && 
              testcase.output && testcase.output.trim() !== ''
            );
            
            if (validTestCases.length === 0) {
              console.log(`Skipping validation for ${language} - no valid test cases`);
              continue;
            }
            
            console.log(`Validating ${language} code with ${validTestCases.length} test cases`);
            
            // I am creating Batch submission
            const submissions = validTestCases.map((testcase)=>({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submissions);
            console.log("Submit result:", submitResult);

            const resultToken = submitResult.map((value)=> value.token);
            console.log("Result tokens:", resultToken);
            
            const testResult = await submitToken(resultToken);
            console.log("Test results:", testResult);

            for(const test of testResult){
              console.log("Test status:", test.status);
              if(test.status.id === undefined || test.status.id === null){
               throw new Error("Judge0 API returned invalid status");
              }
              // Check if test passed (status_id 3 = Accepted)
              if(test.status.id !== 3) {
                throw new Error(`Test failed for ${language}: ${test.status.description || 'Unknown error'}`);
              }
            }
            console.log(`All tests passed for ${language}`);
          }
        } catch (judge0Error) {
          console.error("Judge0 API Error:", judge0Error.message);
          
          // Ask user if they want to continue without validation
          // For now, we'll allow creation with a warning
          console.log("Warning: Judge0 API validation failed, but continuing with problem creation");
          console.log("The problem will be created without code validation");
          
          // You can uncomment the line below to block creation when Judge0 fails
          // return res.status(400).send("Error: Failed to get results from Judge0 API - " + judge0Error.message);
        }
      }


      // We can store it in our DB

    const userProblem =  await Problem.create({
        ...req.body,
        problemCreator: req.result._id
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        console.log("Error in createProblem: ", err);
        res.status(400).send("Error: "+err.message);
    }
}

const updateProblem = async (req,res)=>{
    
  const {id} = req.params;
  const {title,description,difficulty,tags,
    visibleTestCases,hiddenTestCases,startCode,
    referenceSolution, problemCreator
   } = req.body;

  try{

     if(!id){
      return res.status(400).send("Missing ID Field");
     }

    const DsaProblem =  await Problem.findById(id);
    if(!DsaProblem)
    {
      return res.status(404).send("ID is not persent in server");
    }
      
    for(const {language,completeCode} of referenceSolution){
         

      // source_code:
      // language_id:
      // stdin: 
      // expectedOutput:

      const languageId = getLanguageById(language);
        
      // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase)=>({
          source_code:completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output
      }));


      const submitResult = await submitBatch(submissions);
      // console.log(submitResult);

      const resultToken = submitResult.map((value)=> value.token);

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
      
     const testResult = await submitToken(resultToken);

    //  console.log(testResult);

     for(const test of testResult){
      if(test.status_id!=3){
       return res.status(400).send("Error Occured");
      }
     }

    }


  const newProblem = await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
   
  res.status(200).send(newProblem);
  }
  catch(err){
      res.status(500).send("Error: "+err);
  }
}

const deleteProblem = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

   const deletedProblem = await Problem.findByIdAndDelete(id);

   if(!deletedProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send("Successfully Deleted");
  }
  catch(err){
     
    res.status(500).send("Error: "+err);
  }
}


const getProblemById = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');
   
    // video ka jo bhi url wagera le aao

   if(!getProblem)
    return res.status(404).send("Problem is Missing");

   const videos = await SolutionVideo.findOne({problemId:id});

   if(videos){   
    
   const responseData = {
    ...getProblem.toObject(),
    secureUrl:videos.secureUrl,
    thumbnailUrl : videos.thumbnailUrl,
    duration : videos.duration,
   } 
  
   return res.status(200).send(responseData);
   }
    
   res.status(200).send(getProblem);

  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAllProblem = async(req,res)=>{

  try{
     
    const getProblem = await Problem.find({}).select('_id title difficulty tags');

   if(getProblem.length==0)
    return res.status(404).send("Problem is Missing");


   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}


const solvedAllProblembyUser =  async(req,res)=>{
   
    try{
       
      const userId = req.result._id;

      const user =  await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
      });
      
      res.status(200).send(user.problemSolved);

    }
    catch(err){
      res.status(500).send("Server Error");
    }
}

const submittedProblem = async(req,res)=>{

  try{
     
    const userId = req.result._id;
    const problemId = req.params.pid;

   const ans = await Submission.find({userId,problemId});
  
  if(ans.length==0)
    res.status(200).send("No Submission is persent");

  res.status(200).send(ans);

  }
  catch(err){
     res.status(500).send("Internal Server Error");
  }
}



module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};


