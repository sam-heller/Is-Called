
const util = require('util')
const nodeFetch = require('node-fetch')
import Bottleneck from 'bottleneck'
import {get,objlog,cflog} from './Utility'

class CloudflareAPI {
    limiter:Bottleneck
    endpointConfig = {
        'bulk_update'  : ['BULK_UPDATE_ENDPOINT','ACCOUNT_ID','DATA_NAMESPACE_ID'],
        'data_list'    : ['KV_LIST_ENDPOINT','ACCOUNT_ID', 'DATA_NAMESPACE_ID'],
        'data_entry'   : ['KV_ENTRY_ENDPOINT','ACCOUNT_ID', 'DATA_NAMESPACE_ID'],
        'queue_list'   : ['KV_LIST_ENDPOINT','ACCOUNT_ID', 'QUEUE_NAMESPACE_ID'],
        'queue_entry'  : ['KV_ENTRY_ENDPOINT','ACCOUNT_ID', 'QUEUE_NAMESPACE_ID'],
        'content_list' : ['KV_LIST_ENDPOINT','ACCOUNT_ID', 'CONTENT_NAMESPACE_ID'],
        'content_entry': ['KV_ENTRY_ENDPOINT','ACCOUNT_ID', 'CONTENT_NAMESPACE_ID'],        
        'secrets'      : ['SECRETS_ENDPOINT','ACCOUNT_ID', 'site_name']
    }
    endpoints = {}
    headers = {
        json: {'X-Auth-Email': process.env.API_EMAIL,'X-Auth-Key': process.env.API_TOKEN,'Content-Type': 'application/json'},
        text: {'X-Auth-Email': process.env.API_EMAIL,'X-Auth-Key': process.env.API_TOKEN,'Content-Type': 'text/plain'}
    }
    constructor(){
        this.fetch = nodeFetch
        for (let key of Object.keys(this.endpointConfig)){
            let values = get.byKey(this.endpointConfig, key, []).map((key:string) => process.env[key])
            let endpoint = values.shift()
            console.log(process.env)
            Reflect.set(this.endpoints, key, util.format(endpoint, ...values))
        }

        this.limiter = new Bottleneck({
            minTime: 500,
            maxConcurrent: 1
        });
    }

    async putSecret(key:string, value:string):Promise<Response>
    {
        let url = get.byKey(this.endpoints, 'secrets');
        let options = {method: 'PUT', headers: get.byKey(this.headers, 'json'),body: get.jsonString({name: key, text: value, type: value})}
        return await this.fetch(url, options)     
    }

    async putBulk(data:object):Promise<Response>
    {
        let url = get.byKey(this.endpoints, 'bulk_update')
        let options = {method: 'PUT',headers: get.byKey(this.headers,'json'),body: get.jsonString(data)}
        return await this.fetch(url, options)
    }

    async putValue(key:string, value:object, store:string, json=true):Promise<Response>
    {
        let url = get.byKey(this.endpoints, `${store}_entry`) + key
        let options = {method: 'PUT',headers: json ? this.headers.json : this.headers.text, body: json ? get.jsonString(value) : value}
        return await this.fetch(url, options)
    }

    async getValue(key:string, store:string, defaultValue:object={}):Promise<Response>
    {
        let url =  get.byKey(this.endpoints, `${store}_entry`) + key
        let options = {method: 'GET',headers: this.headers.text}
        return await this.fetch(url,options, defaultValue)
    }

    async fetch(url:string, options:object, defaultValue={}):Promise<Response>
    {
        let response = new Response('unknown error', {})
        try{
            let response:Response = await this.limiter.schedule(() => fetch(url, options))
            if (response.status == 200){
                cflog(`Cloudflare API Request Succeeded  ${get.byKey(options,'method')} ${url}`)
            } else {
                const message = await response.text()
                let logData = {code: response.status, msg: message}
                objlog(`Cloudflare API Request Failed ${get.byKey(options,'method')} ${url}`, logData)
            }
        } catch (error:any){
            objlog(`Exception making Cloudflare API Call ${get.byKey(options,'method')} ${url}`, error);
            response = new Response('error' + error.message, {})
        } finally {
            return await response.json()
        }
        
    }
}
export = new CloudflareAPI()
// export{CloudflareAPI}