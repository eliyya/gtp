import { CustomComponent, register } from "../lib/CustomComponent";

@register('canvas-screen')
export default class CanvasScreen extends CustomComponent {
    render(): void {
        this.html`
            <canvas></canvas>
        `
    }
}