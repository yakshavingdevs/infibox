import { Show } from "solid-js";
import type { Command } from "../../src/types/index";

interface Props {
  onHome: () => void;
  onBack?: () => void;
  breadcrumb?: Command[];
}

export default function CmdkHeader(props: Props) {
  return (
    <div class="cmdk-header">
      <div class="cmdk-header-left">
        <Show when={props.breadcrumb && props.breadcrumb.length > 0 && props.onBack}>
          <button class="btn-icon" onClick={props.onBack} title="Go back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </Show>
        <img
          src={chrome.runtime.getURL("img/infibox-logo.svg")}
          class="cmdk-logo"
          alt="Infibox"
        />
        {props.breadcrumb && props.breadcrumb.length > 0 && (
          <div class="cmdk-breadcrumb">
            <span class="cmdk-breadcrumb-sep">/</span>
            {props.breadcrumb.map((cmd, i) => (
              <>
                {i > 0 && <span class="cmdk-breadcrumb-sep">/</span>}
                <span class="cmdk-breadcrumb-item">{cmd.name}</span>
              </>
            ))}
          </div>
        )}
      </div>
      <div class="cmdk-hints">
        <Show when={props.breadcrumb && props.breadcrumb.length > 0}>
          <span class="cmdk-hint">
            <kbd class="cmdk-kbd">Esc</kbd> back
          </span>
        </Show>
        <Show when={!props.breadcrumb || props.breadcrumb.length === 0}>
          <span class="cmdk-hint">
            <kbd class="cmdk-kbd">Esc</kbd> close
          </span>
        </Show>
        <span class="cmdk-hint">
          <kbd class="cmdk-kbd">&uarr;</kbd><kbd class="cmdk-kbd">&darr;</kbd> navigate
        </span>
        <span class="cmdk-hint">
          <kbd class="cmdk-kbd">&crarr;</kbd> select
        </span>
      </div>
    </div>
  );
}
