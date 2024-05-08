export default function ErrorComponent({errorMessage}){
  return (
    <>
      <div className={"container"}>
        <h1 className={"text-center mt-5 mb-5"}>Error</h1>
        <p>{errorMessage}</p>
      </div>
    </>
  );
}