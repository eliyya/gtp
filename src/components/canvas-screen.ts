import { CustomComponent, register } from "../lib/CustomComponent";

@register('canvas-screen')
export default class CanvasScreen extends CustomComponent {
    canvas = document.createElement('canvas')
    ctx = this.canvas.getContext('2d')!

    constructor() {
        super()
        // grid in canvas
        this.effect(() => {
            this.ctx.strokeStyle = '#333'
            this.ctx.lineWidth = 0.5
            
            for (let i = 0; i < this.canvas.width; i += 10) {
                this.ctx.beginPath()
                this.ctx.moveTo(i, 0)
                this.ctx.lineTo(i, this.canvas.height)
                this.ctx.stroke()
            }
        }, [])
    }

    render(): void {
        this.$.appendChild(this.canvas)

        this.css`
            canvas {
                margin: 0;
                padding: 0;
                background-color: #000;
            }
        `
    }
}