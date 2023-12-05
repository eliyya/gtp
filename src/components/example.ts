import { CustomComponent, register } from '../lib/CustomComponent'

@register('example-component')
export class Canvas extends CustomComponent {
    tit = this.state('Canvas App')

    constructor() {
        super()

        this.effect(() => {
            const canvas = this.$.querySelector('canvas')!
            const ctx = canvas.getContext('2d')!
            ctx.fillStyle = 'green'
            ctx.fillRect(10, 10, 150, 100)
        })

        this.effect(() => {
            setTimeout(() => {
                this.tit.value = 'Canvas App (updated)'
            }, 3_000);
        }, [])
    }

    render() {
        this.html`<div>
            <h1>${this.tit}</h1>
            <canvas></canvas>
        <div>`

        this.css`
            canvas {
                width: 100%;
                height: 100%;
                background-color: #1e1e1e;
            }
        `
    }
}