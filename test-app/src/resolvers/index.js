import Resolver from '@forge/resolver';
import api, { fetch } from '@forge/api';

const resolver = new Resolver();


const { GoogleGenerativeAI } = require("@google/generative-ai"); // import

// initialize Generative Model
//const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
const genAI = new GoogleGenerativeAI('AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw');


resolver.define('getGeminiAnswer1', async ({payload, context}) => {
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
  // console.log(text);
});


resolver.define('fetchInfo', async ({payload, context}) => {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");

  return await response.json();
});


export const handler = resolver.getDefinitions();
