import { CustomComponent, register } from "../lib/CustomComponent";

@register('canvas-screen')
export default class CanvasScreen extends CustomComponent {
    canvas = document.createElement('canvas')

    constructor() {
        super()
        // grid in canvas
        
    }

    render(): void {
        this.$.appendChild(this.canvas)

        this.css`
            canvas {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                background-color: #000;
            }
        `
    }
}