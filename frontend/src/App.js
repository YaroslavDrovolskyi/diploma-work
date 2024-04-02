import logo from './logo.svg';
import React, {useEffect, useState} from 'react';
import './App.css';

const { GoogleGenerativeAI } = require("@google/generative-ai"); // import

// initialize Generative Model
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
// const model = genAI.getGenerativeModel({ model: "MODEL_NAME"});

async function getAnswer() {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = "Write a story about a magic backpack."

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
   // console.log(text);
}



function App() {
  const [serverResponse, setServerResponse] = useState(null);

  async function loadData(){
    setServerResponse(await getAnswer());
  }


  // load all datas from server
  useEffect(() => {
    loadData();
  }, []); // in [] put arguments


  return (
    <div className="App">
      <p>API Key: {process.env.REACT_APP_API_KEY}</p>
      <p>Answer {serverResponse}</p>
    </div>
  );
}

export default App;
