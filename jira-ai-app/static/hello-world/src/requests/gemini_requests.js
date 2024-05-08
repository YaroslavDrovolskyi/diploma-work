


///////////////////// https://ai.google.dev/api/rest/v1/models
/// NED to make function to fetch model



const { GoogleGenerativeAI } = require("@google/generative-ai"); // import

const genAI = new GoogleGenerativeAI('AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw');
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

/**
 *
 * @param prompt
 * @return {Promise<string>} text of Gemini response
 */
const getGeminiAnswer = async(prompt) => {
  const result = await model.generateContent(prompt);

  const response = await result.response;
  return response.text();
}

const getPromptNumberOfTokens = async (prompt) => {
  const result = await model.countTokens(prompt);
  return result.totalTokens;
}


/**
 *
 * @param prompt
 * @return object with fields: `ok`, `errorMessage`, `answer`.
 * `answer` and `errorMessage` are mutually exclusive: always one of them is undefined).
 * `answer` is array of objects. Each object has fields: `task`, `description`
 */
export const generateSubtasksForIssue = async(prompt) => {
  try{
    const answer = await getGeminiAnswer(prompt);
    return {ok: true, answer: answer};
  }
  catch(e){
    return {ok: false, errorMessage: 'Something wrong happened. Try again'};
  }
}