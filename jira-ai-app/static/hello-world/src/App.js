import React, { useEffect, useState } from 'react';
import {invoke, view} from '@forge/bridge';
import {getGeminiAnswerJs, getGeminiResponse, getIssue} from "./requests/helpers";
import {Route, Router, Routes} from "react-router";
import Home from "./pages/Home";
import GenerateSubtasksPage from "./pages/GenerateSubtasksPage";
import Page2 from "./pages/Page2";
import SelectIssuesForSprintPage from "./pages/SelectIssuesForSprintPage";
import RefinementPage from "./pages/RefinementPage";
import PrioritizeIssuesPage from "./pages/PrioritizeIssuesPage";
import EstimateIssuesPage from "./pages/EstimateIssuesPage";


/**
 *
 *
 * It is page that defines routing
 *
 *
*/




function App() {
  const [history, setHistory] = useState(null);
  useEffect(() => {
    view.createHistory().then((newHistory) => {
      setHistory(newHistory);
    });
  }, []);
  const [historyState, setHistoryState] = useState(null);


  useEffect(() => {
    if (!historyState && history) {
      setHistoryState({
        action: history.action,
        location: history.location,
      });
    }
  }, [history, historyState]);

  useEffect(() => {
    if (history) {
      history.listen((location, action) => {
        setHistoryState({
          action,
          location,
        });
      });
    }
  }, [history]);


  return (
    <>
      <div>
        {history && historyState ? (
          <Router
            navigator={history}
            navigationType={historyState.action}
            location={historyState.location}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/generate-subtasks" element={<GenerateSubtasksPage />}/>
              <Route path="/refinement" element={<RefinementPage />}/>
              <Route path="/select-for-sprint" element={<SelectIssuesForSprintPage />}/>
              <Route path="/prioritize-issues" element={<PrioritizeIssuesPage />}/>
              <Route path="/estimate-issues" element={<EstimateIssuesPage />}/>
            </Routes>
          </Router>
        ) : (
          "Loading..."
        )}
      </div>


    </>



  );
}

export default App;

/* Sources
Create custom UI app: https://developer.atlassian.com/platform/forge/build-a-custom-ui-app-in-jira/

Routing example: https://developer.atlassian.com/platform/forge/add-routing-to-a-full-page-app/
createHistory: https://developer.atlassian.com/platform/forge/custom-ui-bridge/view/#createhistory
Multi-page app example: https://bitbucket.org/atlassian/forge-ui-modifications-example/src/master/manifest.yml

 */


/*
 const [issue, setIssue] = useState(null);
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);

  useEffect(async () => {
    setIssue(await getIssue('TP-13'));
    setData1(await getGeminiResponse());
    setData2(await getGeminiAnswerJs());
  }, []);

<p>
        {issue ? JSON.stringify(issue) : 'Loading...'}
      </p>
      <p>
        {issue ? JSON.stringify(data1) : 'Loading...'}
      </p>
      <p>
        {issue ? JSON.stringify(data2) : 'Loading...'}
      </p>
 */
