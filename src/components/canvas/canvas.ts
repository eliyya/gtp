import { CustomComponent, register } from '../../CustomComponent'
import './canvas.css'

@register('canvas-app')
class Canvas extends CustomComponent {
    _title = this.state('Canvas App')

    constructor() {
        super()

        this.html`<div>
            <h1>${this._title}</h1>
            <canvas></canvas>
        <div>`

        this.css`
            canvas {
                width: 100%;
                height: 100%;
                background-color: #1e1e1e;
            }
        `

        this.effect(() => {
            const canvas = this.$.querySelector('canvas')!
            const ctx = canvas.getContext('2d')!
            ctx.fillStyle = 'green'
            ctx.fillRect(10, 10, 150, 100)
        }, [this._title])

        this.effect(() => {
            setTimeout(() => {
                this._title.value = 'Canvas App (updated)'
            }, 3_000);
        }, [])
    }
}