
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
    #clicks: string[] = []
    #rendered = false
    #style = document.createElement('style')
    #clickups: [string, string][] = []

    constructor() {
        super()
        this.#emiter.addEventListener('change', () => {
            this.#clickups.forEach(([id, ev]) => {
                const el = this.$.querySelector(`#${id}`)
                if (el) {
                    // @ts-expect-error
                    el.removeEventListener(ev, this[ev])
                    // @ts-expect-error
                    el.addEventListener(ev, this[ev])
                }
            })
        })
    }
    
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
        this.#style.textContent = a.reduce((acc,cur,i)=>acc+b[i-1]+cur)
        this.$.appendChild(this.#style)
        this.#css = [a,b]
    }
    
    html(a:TemplateStringsArray,...b:any[]){
        this.$.innerHTML = a.reduce((acc,cur,i)=>acc+b[i-1]+cur)
        this.#html = [a,b]
    }

    connectedCallback() {
        this.render()
        // check if rendered
        this.#rendered = true
        this.#emiter.dispatchEvent(new CustomEvent('rendered'))
    }

    render() {
        this.html(...this.#html)
        this.css(...this.#css)
    }

    registerClick(id:string, fn: (e: any) => void) {
        fn.toString = () => id
        document.addEventListener(id, fn)
        return fn
    }

    compile(a:string, element: HTMLElement){
        const eventRegex = new RegExp(`<[^>]+(id="[^"]+")?(@click="[^"]+")(id="[^"]+")?([^>]+)?>`, 'gm')
        const events = a.match(eventRegex) ?? []
        const evn = []
        for (let event of events) {
            const originalEvent = event
            event = event.replace(/\ +/g, ' ').replace(/\n/g, '')
            const groups = [...event.matchAll(/<([\s]+)?([\w]+(-[\w]+)?)\s+(?<id>id="[^"]+")?([\ ]+)?(?<ev>@click="[^"]+")([\ ]+)?(?<it>id="[^"]+")?([\ ]+)?>/g)][0]?.groups??{}
            let id = (groups.id ?? groups.it ?? '').replace(/id="([^"]+)"/, '$1')
            const ev = (groups.ev ?? '').replace(/@click="([^"]+)"/, '$1')
            if (!id) {
                id = Math.random().toString(36).substring(2, 9)
                event = event.replace(/<(?<el>([\s]+)?([\w]+(-[\w]+)?)\s+)/, `<$<el> id="${id}" `)
            }
            event = event.replace(/@click="([^"]+)"/, `onclick="pev('${id+ev}')"`)
            a = a.replace(originalEvent, event)
            evn.push([id, ev])
        }
        
        a = a + html`
        <script>
            const pev = (ev) => {
                const event = new CustomEvent('')
                document.dispatchEvent(event)
            }
        </script>
        `
        element.innerHTML = a
        console.log(a);

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

