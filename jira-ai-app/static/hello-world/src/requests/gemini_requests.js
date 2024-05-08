


// move checking inputTokensLimit to getGeminiAnswer. Need to throw exception from that method
// how to test throwing exception to make fake condition (something like true === true)



const { GoogleGenerativeAI } = require("@google/generative-ai"); // import

const API_KEY = 'AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw'
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});



/**
 *  Fetches model info.
 *
 *  Model info is object with such [structure](https://ai.google.dev/api/rest/v1/models).
 *
 * This method uses the corresponding API [endpoint](https://ai.google.dev/api/rest/v1/models/get).
 * The `model` parameter of endpoint's request can be taken from `GenerativeModel.model` property.
 * Btw, `GenerativeModel.model` equals to returned object's `name` property.
 * @return {Promise<any>}
 */
export const fetchModelInfo = async() => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/${model.model}?key=${API_KEY}`);
  return await response.json();
}

/**
 * Counts number of tokens in the provided prompt.
 * Note, that 100 tokens is approximately 60-70 words of natural human text.
 *
 * This method uses `GenerativeModel.countTokens()` method
 * @param prompt
 * @return {Promise<number>}
 */
const countNumberOfTokens = async (prompt) => {
  const result = await model.countTokens(prompt);
  return result.totalTokens;
}

/**
 * Template method for getting text answers from Gemini.
 * It is supposed to be used by other methods simply by passing the `prompt` parameter.
 * @param prompt
 * @return {Promise<string>} text of Gemini response
 */
const getGeminiAnswer = async(prompt) => {
  const result = await model.generateContent(prompt);

  const response = await result.response;
  return response.text();
}




/**
 *
 * @param prompt
 * @return object with fields: `ok`, `errorMessage`, `answer`.
 * `answer` and `errorMessage` are mutually exclusive: always one of them is undefined.
 * `answer` is array of objects. Each object has fields: `task`, `description`.
 * `errorMessage` is message you can display to user
 */
export const generateSubtasksForIssue = async(prompt) => {
  const modelInfo = await fetchModelInfo();

  // check if prompt is too long
  const modelInputTokenLimit = modelInfo.inputTokenLimit;
  const numberOfTokens = await countNumberOfTokens(prompt);
  console.log(`numberOfTokens: ${numberOfTokens}`); //////////////////////////////////////////////////////////////////
  console.log(`modelInputTokenLimit: ${modelInputTokenLimit}`); ////////////////////////////////////////
  if(numberOfTokens > modelInputTokenLimit){
    return {ok: false, errorMessage: `Sorry, but query is too large and LLM used can't process it.\
    Your query is ${numberOfTokens} tokens but model's limit is ${modelInputTokenLimit}`};
  }

  try{
    const answer = await getGeminiAnswer(prompt);
    return {ok: true, answer: answer};
    //////////////////////////////////////// NEED to pparse answer
  }
  catch(e){
    return {ok: false, errorMessage: 'Something wrong happened. Try again'};
  }
}