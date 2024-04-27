import Resolver from '@forge/resolver';
import api, { fetch } from '@forge/api';

const resolver = new Resolver();


const { GoogleGenerativeAI } = require("@google/generative-ai"); // import

// initialize Generative Model
//const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
const genAI = new GoogleGenerativeAI('AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw');


resolver.define('getGeminiAnswer1', ({payload, context}) => {
  const result = fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': 'AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw'
      },
      body: {
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
    }
  );
//  const status = result.status;

  return result;//.text;
  // console.log(text);
});


resolver.define('getGeminiAnswer2', ({payload, context}) => {
  console.log(payload.a);

  const result = api.fetch("https://jsonplaceholder.typicode.com/todos/1");
//  const status = result.status;

  return result;//.text;
  // console.log(text);
});


export const handler = resolver.getDefinitions();
