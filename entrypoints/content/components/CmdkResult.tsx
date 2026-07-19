import CmdkHeader from "./CmdkHeader";

interface Props {
  title: string;
  result: string;
  onBack: () => void;
  onHome: () => void;
}

export default function CmdkResult(props: Props) {
  function copy() {
    navigator.clipboard.writeText(props.result)
      .then(() => alert("Copied to clipboard!"))
      .catch((err: unknown) => alert("Failed to copy: " + err));
  }

  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <div class="result-container">
        <p>Result for <strong>{props.title}</strong>:</p>
        <div class="result-box">{props.result}</div>
        <button onClick={copy}>Copy to Clipboard</button>
        <button class="back-button" onClick={props.onBack}>Back</button>
      </div>
    </>
  );
}
