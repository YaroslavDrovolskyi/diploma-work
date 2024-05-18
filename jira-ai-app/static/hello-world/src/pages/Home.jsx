
import {useEffect, useState} from "react";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines, convertPlainTextToADF, checkFieldsValidity} from "../logic/helpers.js";
import {useNavigate} from "react-router";


function Link({ to, children }) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

export default function Home() {

  return(
    <>
    <div className="container">
      <h1 className={"text-center"}>AI helper for Jira</h1>
      <p className={"mb-0"}>It is an <b>AI helper</b> for Scrum projects in Jira. It will help you to automate part of your daily working routine.</p>
      <p className={"mb-0"}>This app uses <b>Gemini API</b> for AI-powered functions.
        Therefore, you can use it only from countries where Gemini API
        is available <a href="https://ai.google.dev/gemini-api/docs/available-regions#available_regions"> (list of countries)</a>, or use VPN.</p>
      <p className={"mb-3"}>The application is developed by <b>Yaroslav Drovolskyi</b>.</p>


      <p className={"mb-0"}>The following <b>functions</b> are available:</p>
      <ul>
        <li><Link to={"/generate-subtasks"}>Generate subtasks</Link></li>
        <li><Link to={"/refinement"} >Refine User story / Task</Link></li>
        <li><Link to={"/select-for-sprint"}>Select user stories / tasks for sprint</Link></li>
        <li><Link to={"/prioritize-issues"}>Prioritize user stories / tasks</Link></li>
        <li><Link to={"/estimate-issues"}>Estimate user stories / tasks</Link></li>
      </ul>

    </div>
    </>
  );



  const loadData = async () => {
  }


  useEffect(() => {
    loadData().then(r => console.log('loadData() finished'));
  }, []);

}