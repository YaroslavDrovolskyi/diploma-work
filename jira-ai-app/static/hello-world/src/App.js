import React, { useEffect, useState } from 'react';
import {invoke, view} from '@forge/bridge';
import {getGeminiAnswerJs, getGeminiResponse, getIssue} from "./helpers";
import {Route, Router, Routes} from "react-router";
import Home from "./pages/Home";
import Page1 from "./pages/Page1";
import Page2 from "./pages/Page2";
import Page3 from "./pages/Page3";

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




  const [issue, setIssue] = useState(null);
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);

  useEffect(async () => {
    setIssue(await getIssue('TP-13'));
    setData1(await getGeminiResponse());
    setData2(await getGeminiAnswerJs());
  }, []);

  return (
    <>
      <div>
        <p>
          {issue ? JSON.stringify(issue) : 'Loading...'}
        </p>
        <p>
          {issue ? JSON.stringify(data1) : 'Loading...'}
        </p>
        <p>
          {issue ? JSON.stringify(data2) : 'Loading...'}
        </p>

        {history && historyState ? (
          <Router
            navigator={history}
            navigationType={historyState.action}
            location={historyState.location}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/page-1" element={<Page1 />}/>
              <Route path="/page-2" element={<Page2 />}/>
              <Route path="/page-3" element={<Page3 />}/>
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
