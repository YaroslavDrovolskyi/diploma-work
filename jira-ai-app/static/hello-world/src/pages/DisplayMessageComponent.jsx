export default function DisplayMessageComponent({heading, message}){
  return (
    <>
      <div className={"container"}>
        <h1 className={"text-center mt-5 mb-5"}>{heading}</h1>
        <p className={"text-center"}>{message}</p>
      </div>
    </>
  );
}