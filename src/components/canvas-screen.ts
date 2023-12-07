import { CustomComponent, register } from "../lib/CustomComponent";

@register('canvas-screen')
export default class CanvasScreen extends CustomComponent {
    canvas = document.createElement('canvas')
    render(): void {
        this.$.appendChild(this.canvas)
    }
}