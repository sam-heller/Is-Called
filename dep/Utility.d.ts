declare var global: NodeJS.Global & typeof globalThis;

export interface get {
    jsonString(o:object, f:string):object 
    jsonObject(s:string,f:object|null):object
    size(o:any):number
    withDefault(v:any, d:any):boolean
    values(o:object):any[]
    random(o:any[]):any
    byKey(o:object,k:string,f:any):any
    
}

export interface is {
    a(a:any, t:string):boolean
    boolean(a:any):boolean
    string(a:any):boolean
    number(a:any):boolean
    object(a:any):boolean
    function(a:any):boolean
    blob(a:any):boolean
    error(a:any):boolean
    regex(a:any):boolean
    date(a:any):boolean
    iterable(a:any):boolean
    jsonString(a:any):boolean
    null(a:any):boolean
    empty(a:any):boolean
    undefined(a:any):boolean
}

export{}