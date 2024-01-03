import "./style.css";
import { html } from "./lib/CustomComponent.ts";
import "./components/canvas-screen.ts";
import {
  setupCanvas,
  setupReturnButton,
  setupTools,
} from "./components/canvas-screen.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = html`
  <canvas></canvas>
  <button id="return">Return</button>
  <nav id="tools">
    <button>Move</button>
    <button>Select</button>
  </nav>
`;

setupCanvas(document.querySelector<HTMLCanvasElement>("canvas")!);
setupReturnButton(document.querySelector<HTMLButtonElement>("button")!);
setupTools(document.querySelector<HTMLElement>("#tools")!);
