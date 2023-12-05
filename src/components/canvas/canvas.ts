import './canvas.css'

// decorator for registering custom elements
function register(name:string){
    return function(constructor:CustomElementConstructor){
        customElements.define(name, constructor)
    }
}

class CustomComponent extends HTMLElement {
    $ = this.attachShadow({mode:'open'})
    // create a state magnament like a preact signal for rendering
    #html:[TemplateStringsArray, any[]] = [null, null]
    #css:[TemplateStringsArray, any[]] = [null, null]
    state = <T>(init:T):{value:T} => {
        return new Proxy({value: init}, {
            set: (target, key: string, value) => {
                if (key !== 'value') return undefined
                target['value'] = value
                // this.render()
                this.html(...this.#html)
                this.css(...this.#css)
                this.render()
                return value
            },
            get(target, key: string) {
                // console.log('get',target,'key',key, 'v', target[key])
                if (key === 'value') return target['value']
                if (key === 'toString') return () => `${target['value']}`
                if (key === 'valueOf') return () => target['value']
                return target[key]
            }
        })
    }
    css(a:TemplateStringsArray,...b:any[]){
        const style = document.createElement('style')
        style.textContent = a.reduce((acc,cur,i)=>acc+b[i-1]+cur)
        this.$.appendChild(style)
        this.#css = [a,b]
    }
    html(a:TemplateStringsArray,...b:any[]){
        this.$.innerHTML = a.reduce((acc,cur,i)=>acc+b[i-1]+cur)
        this.#html = [a,b]
    }

    init() {

    }
    
    connectedCallback() {
        this.render()
        this.init()
    }

    render() {
    }
}

@register('canvas-app')
class Canvas extends CustomComponent {
    title = this.state('Canvas App')

    constructor() {
        super()

        this.html`<div>
            <h1>${this.title}</h1>
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

    render() {
        const canvas = this.$.querySelector('canvas')!
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = 'green'
        ctx.fillRect(10, 10, 150, 100)
    }

    init() {
        setTimeout(() => {
            this.title.value = 'Canvas App (updated)'
        }, 3_000);
    }
}