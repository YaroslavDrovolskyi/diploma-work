import {requestJira} from "@forge/bridge";

export const getIssue = async(issueIdOrKey) => {
  const response = await requestJira(`/rest/agile/1.0/issue/${issueIdOrKey}`);

  console.log(`Response (getIssue()): ${response.status} ${response.statusText}`);
  return await response.json();
}



export const getGeminiResponse = async() => {
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: "Generate me 10 user stories (according to Scrum framework) for Instant messaging app"
          }
        ]
      }
    ]
  }


  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': 'AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw'
      },
      body: JSON.stringify(requestBody)
    }
  );
//  const status = result.status;

  return await response.json();//.text;
}






const { GoogleGenerativeAI } = require("@google/generative-ai"); // import

const genAI = new GoogleGenerativeAI('AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw');

export const getGeminiAnswerJs = async() => {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = "Write a story about a magic backpack."

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}