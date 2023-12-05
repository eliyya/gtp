
// decorator for registering custom elements
export function register(name:string){
    return function(constructor: Function){
        customElements.define(name, constructor as CustomElementConstructor)
    }
}

export type state<T> = {
    value: T
    on: (event: string, fn: (e: any) => void) => void
}

export class CustomComponent extends HTMLElement {
    $ = this.attachShadow({mode:'open'})
    // @ts-expect-error
    #html:[TemplateStringsArray, any[]] = [null, null]
    // @ts-expect-error
    #css:[TemplateStringsArray, any[]] = [null, null]
    #emiter = new EventTarget()
    #rendered = false
    
    state = <T>(init:T):state<T> => {
        const emiter = new EventTarget()
        return new Proxy({value: init}, {
            set: (target, key: string, value) => {
                if (key !== 'value') return undefined
                target['value'] = value
                this.render()
                emiter.dispatchEvent(new CustomEvent('change'))
                this.#emiter.dispatchEvent(new CustomEvent('change'))
                return value
            },
            get(target, key: string) {
                if (key === 'value') return target['value']
                if (key === 'toString') return () => `${target['value']}`
                if (key === 'valueOf') return () => target['value']
                if (key === 'on') 
                    return (
                        event: string, 
                        fn: (e: any) => void
                    ) => emiter.addEventListener(event, fn)
                return (target as any)[key]
            }
        }) as state<T>
    }
    
    effect = (fn:()=>void, dep?:state<any>[]) => {
        if (this.#rendered) fn()
        else this.#emiter.addEventListener('rendered', fn)
        if (dep?.length) dep.forEach(state => state.on('change', fn))
        if (typeof dep === 'undefined') this.#emiter.addEventListener('change', fn)
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

    connectedCallback() {
        this.render()
        this.#rendered = true
        this.#emiter.dispatchEvent(new CustomEvent('rendered'))
    }

    render() {
        this.html(...this.#html)
        this.css(...this.#css)
    }
}
export function html(a:TemplateStringsArray,...b:any[]){
    return a.reduce((acc,cur,i)=>acc+b[i-1]+cur)
}
export function css(a:TemplateStringsArray,...b:any[]){
    return `
        <style>
            ${a.reduce((acc,cur,i)=>acc+b[i-1]+cur)}
        </style>
    `
}