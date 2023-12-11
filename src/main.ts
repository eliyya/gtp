import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import { html } from './lib/CustomComponent.ts'
import './components/canvas-screen.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = html`
  <canvas-screen></canvas-screen>
`
// const canvas = setupCanvas(document.querySelector<HTMLCanvasElement>('canvas')!)
// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
