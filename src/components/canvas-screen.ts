import { CustomComponent, register, html } from "../lib/CustomComponent";

@register('canvas-screen')
export default class CanvasScreen extends CustomComponent {
    canvas = document.createElement('canvas')
    ctx = this.canvas.getContext('2d')!
    userInterface = document.createElement('main')
    mouse = {
        x: 0,
        y: 0
    }
    #center = {
        x: 0,
        y: 0
    }
    #startDrag = {
        x: 0,
        y: 0
    }
    #dragPoint = {
        x: 0,
        y: 0
    }
    mouseMove: 'normal' | 'drag' = 'normal'
    tool: 'move' = 'move'

    get center() {
        return {
            x: this.#center.x + this.#dragPoint.x,
            y: this.#center.y + this.#dragPoint.y
        }
    }

    ontest = this.registerClick('test', () => alert('test'))
    constructor() {
        super()

        this.compile(html`
            <header>header</header>
            <footer>
                <button id="ts" @click="${this.ontest}">return</button>
                <button 
                id="ts2" 
                @click="${this.ontest}"
                >return2</button>
                <button 
                @click="${this.ontest}"
                id="ts3" 
                >return3</button>
                <button @click="${this.ontest}">return4</button>
            </footer>
        `, this.userInterface)

        this.effect(()=> {
            window.addEventListener('resize', () => {
                this.canvas.height = window.innerHeight
                this.canvas.width = window.innerWidth
                this.renderCanvas()
            })

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX
                this.mouse.y = e.clientY
                
                if (this.mouseMove === 'drag') {
                    this.#dragPoint.x = (e.clientX - this.#startDrag.x)
                    this.#dragPoint.y = (e.clientY - this.#startDrag.y)
                    this.renderCanvas()
                }
                this.renderCanvas()
            })

            window.addEventListener('mousedown', (e) => {
                console.log('start drag', e.clientX, e.clientY);
                
                if (this.tool === 'move') {
                    this.canvas.style.cursor = 'grabbing'
                    this.mouseMove = 'drag'
                    this.#startDrag.x = e.clientX
                    this.#startDrag.y = e.clientY
                }
            })
            window.addEventListener('mouseup', (e) => {
                console.log('end drag', e.clientX, e.clientY);
                console.log('dif', e.clientX - this.#startDrag.x, e.clientY - this.#startDrag.y);
                
                if (this.tool === 'move') {
                    this.mouseMove = 'normal'
                    this.#center.x = this.#center.x + (e.clientX - this.#startDrag.x)
                    this.#center.y = this.#center.y + (e.clientY - this.#startDrag.y)
                    this.#dragPoint.x = 0
                    this.#dragPoint.y = 0
                    this.canvas.style.cursor = 'grab'
                }
                this.renderCanvas()
            })
            this.renderCanvas()
        }, [])
    }

    renderCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = '#fff'
        this.ctx.beginPath()
        this.ctx.arc(this.mouse.x, this.mouse.y, 5, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.closePath()

        // center
        this.ctx.beginPath()
        this.ctx.strokeStyle = '#ffffff88'
        this.ctx.moveTo(this.center.x, 0)
        this.ctx.lineTo(this.center.x, this.canvas.height)
        this.ctx.stroke()
        this.ctx.closePath()

        this.ctx.beginPath()
        this.ctx.strokeStyle = '#ffffff88'
        this.ctx.moveTo(0, this.center.y)
        this.ctx.lineTo(this.canvas.width, this.center.y)
        this.ctx.stroke()
        this.ctx.closePath()

        // drag point
        // this.ctx.beginPath()
        // this.ctx.strokeStyle = '#fff'
        // this.ctx.strokeRect(this.#startDrag.x, this.#startDrag.y, this.#dragPoint.x, this.#dragPoint.y)
    }

    render(): void {
        this.$.appendChild(this.canvas)
        this.canvas.style.cursor = this.tool === 'move' ? 'grab' : 'default'

        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.#center.x = this.canvas.width / 2
        this.#center.y = this.canvas.height / 2
        this.$.appendChild(this.userInterface)
        
        // this.canvas.height = this.$.fullscreenElement!.clientHeight!

        this.css`
            :host {
                width: 100%;
                height: 100%;
                overflow: hidden;
            }

            canvas {
                margin: 0;
                padding: 0;
                background-color: #1e1e1e;
            }

            main {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: transparent;
                padding: 1rem;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;

                > footer {

                }
            }
        `
    }
}