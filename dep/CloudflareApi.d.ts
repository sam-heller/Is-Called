
export class CloudflareAPI{
    [index: string]: any
    endpoints:Arraystore
    headers:ObjectStore
}
export interface ObjectStore{[index:string]: KeyedObject}
export interface KeyedObject{[index:string]: any}
export interface Arraystore{[index:string]:[any]}





