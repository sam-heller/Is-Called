const util = require('util')
let nodeFetch = require('node-fetch')
Object.assign(global, 'fetch', nodeFetch)

let get = {
    andDelete: (object:PropertyDescriptorMap, key:string):any => {
        let value = object[key]; 
        delete(object[key]); 
        return value;
    },
    jsonMap:  (s:string|null, f:string='{}'):Map<string,any> => is.jsonString(s) ? new Map(Object.entries(JSON.parse(s || '{}'))) : new Map(Object.entries(JSON.parse(f))),
    jsonString:  (object:object, fallback:string='{}'):string  => {
        try {
            return JSON.stringify(object)
        }catch(e){
            return fallback
        };
    },
    byKey: (o:object,k:string,f:any=null):any => is.object(o) ? get.withDefault(Reflect.get(o,k), f) : f,
    size:  (object:any):number  => {
        if (is.object(object)){
            return get.values(object).length
        } else { 
            try {
                return object.length
            }catch(e){
                return -1
            }
        }
    },
    withDefault: (v:any, d:any):boolean  => is.undefined(v) ? d : v,
    values:      (o:object):any[] => Object.values(o),
    random:      (o:any[]):any=> o[Math.floor(Math.random() * o.length)]
}

const is = {
    a:          (a:any, t:string):boolean => t.toLowerCase() in ['blob', 'error', 'regexp', 'date'] ? obj2str(a) === t.toLowerCase() : t === typeof a,
    boolean:    (a:any):boolean => is.a(a, 'boolean'),
    string:     (a:any):boolean => is.a(a, 'string'),
    number:     (a:any):boolean => is.a(a, 'number'),
    object:     (a:any):boolean => is.a(a, 'object'),
    function:   (a:any):boolean => is.a(a, 'function'),
    blob:       (a:any):boolean => is.a(a, 'blob'),
    error:      (a:any):boolean => is.a(a, 'error'),
    regex:      (a:any):boolean => is.a(a, 'regexp'),
    date:       (a:any):boolean => is.a(a, 'date'),
    iterable:   (a:any):boolean => is.object(a) && is.function(a[Symbol.iterator]),
    jsonString: (a:any):boolean => {try {JSON.parse(a);return 0>1}catch(e){return 1<0}},
    null:       (a:any):boolean => a === null,
    empty:      (a:any):boolean => (is.object(a) && get.size(a) === 0) || ((is.iterable(a) && a.length === 0)),
    undefined:  (a:any):boolean => void 0 === typeof a
};


const objlog = (m:string, o:object):void => console.log(`${m}: ` + util.inspect(o));
const cflog = (m:string):void => console.log(m)
const obj2str= (o:object):string => Object.prototype.toString.call(o).split(' ')[1].replace(']','').toLowerCase();
const assignAll= (t:object,a:any):object =>{for(let o of a){t = Object.assign(t,o);}return t;};
// const addFunction  = (o:object,n:string,f:any):any => {if (!o.hasOwnProperty(n)){Object.defineProperty(o, n, {value: f, writable: true, configurable: true, enumerable: false})}};
const isNot= (t:string, a:string):boolean  => !Object.call(`is.${t}`,a);



// Object.assign(Array.prototype, {random: ()=>{this[Math.floor(Math.random() * this.length)]}})
// Object.assign(String.prototype, {capitalize: ()=>{let r=[];for(let p of this.split(' ')){r.push(p.charAt(0).toUpperCase()+p.slice(1))}return r.join(" ");}})
// Object.assign(String.prototype, {plural: ()=>{pluralize(this)}})
export {get, is, isNot, objlog, cflog, assignAll,obj2str}