import {fetchAllBoardsForProject} from "../requests/template_requests";
import {createEstimateIssuesPrompt, createPrioritizeIssuesPrompt} from "../requests/prompts_generators";
import {useEffect} from "react";


export default function PrioritizeIssuesPage(){
  const loadData = async() => {
    const prioritizePrompt = await createPrioritizeIssuesPrompt(
      "<< PRODUCT >>",
      "<< PRODUCT_VISION >>",
      "[{1}, {2}, {3}, {4}, {5}, {6}]",
      "[{1}, {2}, {3}, {4}, {5}]",
    );
    console.log(`Prioritize prompt: ${prioritizePrompt}`);

    const estimatePrompt = await createEstimateIssuesPrompt(
      "<< PRODUCT >>",
      "<< PRODUCT_VISION >>",
      "[{1}, {2}, {3}, {4}, {5}]",
    );
    console.log(`Estimate prompt: ${estimatePrompt}`);
  };


  useEffect(() => {
    loadData();
  }, []);


  return(
    <>
      <p>Hello!</p>
    </>
  );
}