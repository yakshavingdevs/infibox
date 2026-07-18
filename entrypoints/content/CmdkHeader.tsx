
interface Props {
  onHome: () => void;
}

export default function CmdkHeader(props: Props) {
  return (
    <>
      <div class="cmdk-header">
        <button class="home-button" onClick={props.onHome}>Home</button>
        <img src={chrome.runtime.getURL("img/infibox-logo.svg")} height={36} />
      </div>
      <div class="cmdk-header">
        <div class="cmdk-hints">
          Enter: Submit &bull; &uarr;/&darr;: Navigate &bull; Esc: Cancel &bull; Backspace: Back &bull; ?: Help
        </div>
      </div>
    </>
  );
}
