export module htmldom{
  
}

export interface HTMLDomNode {
    (selector:string):HTMLDomNode
    [index: number]: HTMLDomNode
    [Symbol.iterator]():HTMLDomNode
    eq(index:number): HTMLDomNode
    find(selector:string): HTMLDomNode
    html():string
    next():{done:boolean, value:HTMLDomNode}
    children:HTMLDomNode
    data:string
    attributes:HTMLDomNodeAttributes
    textContent:string
    src:string
}

export interface HTMLDomNodeAttributes {
    href:string
    src:string
}

export function createHtmlDom(html:string):HTMLDomNode

