const axios = require('axios');


const getLanguageById = (lang)=>{

    const language = {
        "c++":54,
        "cpp":54,
        "C++":54,
        "java":62,
        "Java":62,
        "javascript":63,
        "JavaScript":63,
        "js":63
    }

    console.log(`Getting language ID for: "${lang}"`);
    const languageId = language[lang];
    console.log(`Language ID result: ${languageId}`);
    
    if (!languageId) {
        throw new Error(`Unsupported language: ${lang}. Supported languages are: C++, Java, JavaScript`);
    }

    return languageId;
}


const submitBatch = async (submissions)=>{

if (!process.env.JUDGE0_KEY) {
    throw new Error("JUDGE0_KEY environment variable is not set");
}

// Validate submissions format
for (let i = 0; i < submissions.length; i++) {
  const submission = submissions[i];
  if (!submission.source_code || !submission.language_id) {
    throw new Error(`Invalid submission at index ${i}: missing source_code or language_id`);
  }
  
  // Ensure all required fields are present
  if (typeof submission.source_code !== 'string') {
    throw new Error(`Invalid submission at index ${i}: source_code must be a string`);
  }
  
  if (typeof submission.language_id !== 'number') {
    throw new Error(`Invalid submission at index ${i}: language_id must be a number`);
  }
  
  // Make stdin and expected_output optional but ensure they're strings if present
  if (submission.stdin && typeof submission.stdin !== 'string') {
    throw new Error(`Invalid submission at index ${i}: stdin must be a string`);
  }
  
  if (submission.expected_output && typeof submission.expected_output !== 'string') {
    throw new Error(`Invalid submission at index ${i}: expected_output must be a string`);
  }
}

const requestBody = { submissions };
console.log("Submitting to Judge0 API:", JSON.stringify(requestBody, null, 2));

const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': process.env.JUDGE0_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: requestBody
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error("Judge0 API Error Details:", {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message
		});
    if (error.response?.data) {
      console.error('Judge0 API error response:', JSON.stringify(error.response.data, null, 2));
    }
    // Try a minimal hardcoded test submission for debugging
    try {
      const testSubmission = [{
        language_id: 63,
        source_code: "print('Hello, World!')",
        stdin: "",
        expected_output: "Hello, World!"
      }];
      const testOptions = {
        ...options,
        data: { submissions: testSubmission }
      };
      console.log('Testing Judge0 API with minimal valid submission:', JSON.stringify(testOptions.data, null, 2));
      const testResponse = await axios.request(testOptions);
      console.log('Judge0 API minimal test response:', testResponse.data);
    } catch (testError) {
      console.error('Judge0 API minimal test failed:', testError.response?.data || testError.message);
    }
		if (error.response?.status === 401) {
			throw new Error("Invalid Judge0 API key - please check your RapidAPI subscription");
		} else if (error.response?.status === 429) {
			throw new Error("Judge0 API rate limit exceeded - please wait and try again");
		} else if (error.response?.status >= 500) {
			throw new Error("Judge0 API server error - please try again later");
		} else if (error.response?.status === 400) {
			const errorData = error.response?.data;
			if (errorData?.message) {
				throw new Error(`Judge0 API validation error: ${errorData.message}`);
			} else {
				throw new Error("Invalid request format to Judge0 API");
			}
		} else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
			throw new Error("Cannot connect to Judge0 API - check your internet connection");
		} else {
			throw new Error("Failed to submit code to Judge0 API: " + (error.response?.data?.message || error.message));
		}
	}
}

 return await fetchData();

}


const waiting = async(timer)=>{
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(1);
    }, timer);
  });
}

// ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

const submitToken = async(resultToken)=>{

if (!process.env.JUDGE0_KEY) {
    throw new Error("JUDGE0_KEY environment variable is not set");
}

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': process.env.JUDGE0_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error("Judge0 API Error Details:", {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message
		});
		
		if (error.response?.status === 401) {
			throw new Error("Invalid Judge0 API key - please check your RapidAPI subscription");
		} else if (error.response?.status === 429) {
			throw new Error("Judge0 API rate limit exceeded - please wait and try again");
		} else if (error.response?.status >= 500) {
			throw new Error("Judge0 API server error - please try again later");
		} else if (error.response?.status === 400) {
			const errorData = error.response?.data;
			if (errorData?.message) {
				throw new Error(`Judge0 API validation error: ${errorData.message}`);
			} else {
				throw new Error("Invalid request format to Judge0 API");
			}
		} else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
			throw new Error("Cannot connect to Judge0 API - check your internet connection");
		} else {
			throw new Error("Failed to get results from Judge0 API: " + (error.response?.data?.message || error.message));
		}
	}
}

let attempts = 0;
const maxAttempts = 30; // 30 seconds timeout

while(attempts < maxAttempts){
 const result =  await fetchData();
 
 console.log("Judge0 API response structure:", {
   hasSubmissions: !!result.submissions,
   submissionsCount: result.submissions?.length,
   firstSubmission: result.submissions?.[0],
   firstSubmissionStatus: result.submissions?.[0]?.status
 });

  const IsResultObtained =  result.submissions.every((r)=>r.status && r.status.id>2);

  if(IsResultObtained)
    return result.submissions;

  attempts++;
  await waiting(1000);
}

throw new Error("Timeout waiting for Judge0 API results. Please try again or check your internet connection.");

}


// Test function to verify Judge0 API connection
const testJudge0Connection = async () => {
  try {
    const testSubmission = [{
      source_code: "print('Hello, World!')",
      language_id: 63, // JavaScript
      stdin: "",
      expected_output: "Hello, World!"
    }];
    
    console.log("Testing Judge0 API connection...");
    const result = await submitBatch(testSubmission);
    console.log("Judge0 API test successful:", result);
    return true;
  } catch (error) {
    console.error("Judge0 API test failed:", error.message);
    return false;
  }
};

module.exports = {getLanguageById,submitBatch,submitToken,testJudge0Connection};








// 


