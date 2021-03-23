
const util = require('util')
const Bottleneck = require('bottleneck')

class CloudflareAPI{
    endpoints = {
        'bulk_update'  : ['BULK_UPDATE_ENDPOINT','account_id','DATA_NAMESPACE_ID'],
        'data_list'    : ['KV_LIST_ENDPOINT','account_id', 'DATA_NAMESPACE_ID'],
        'data_entry'   : ['KV_ENTRY_ENDPOINT','account_id', 'DATA_NAMESPACE_ID'],
        'queue_list'   : ['KV_LIST_ENDPOINT','account_id', 'QUEUE_NAMESPACE_ID'],
        'queue_entry'  : ['KV_ENTRY_ENDPOINT','account_id', 'QUEUE_NAMESPACE_ID'],
        'content_list' : ['KV_LIST_ENDPOINT','account_id', 'CONTENT_NAMESPACE_ID'],
        'content_entry': ['KV_ENTRY_ENDPOINT','account_id', 'CONTENT_NAMESPACE_ID'],        
        'secrets'      : ['SECRETS_ENDPOINT','account_id', 'site_name']
    }
    headers = {
        json: {'X-Auth-Email': process.env.API_EMAIL,'X-Auth-Key': process.env.API_TOKEN,'Content-Type': 'application/json'},
        text: {'X-Auth-Email': process.env.API_EMAIL,'X-Auth-Key': process.env.API_TOKEN,'Content-Type': 'text/plain'}
    }
    constructor(){
        for (let key of Object.keys(this.endpoints)){
            let values = this.endpoints[key].map(k => process.env[k])
            let endpoint = values.shift()
            this.endpoints[key] = util.format(endpoint, ...values)
        }
        this.limiter = new Bottleneck({
            minTime: process.env.CLOUDFLARE_API_MIN_MS_BETWEEN_REQUESTS,
            maxConcurrent: 1
        });
    }

    async putSecret(key, value){
        let url = this.endpoints['secrets'];
        let options ={method: 'PUT', headers: this.headers.json,body: JSON.stringify({name: key, text: value, type: value})}
        await this.fetch(url, options)     
    }

    async putBulk(data){
        let url = this.endpoints['bulk_update']
        let options = {method: 'PUT',headers: this.headers.json,body: JSON.stringify(data)}
        await this.fetch(url, options)
    }

    async putValue(key, value, store, json=true){
        let url = this.endpoints[`${store}_entry`] + key
        let options = {method: 'PUT',headers: json ? this.headers.json : this.headers.text, body: json ? JSON.stringify(value) : value}
        await this.fetch(url, options)
    }

    async getValue(key, store, defaultValue={}){
        let url = this.endpoints[`${store}_entry`] + key
        let options = {method: 'GET',headers: this.headers.text}
        return await this.fetch(url,options, defaultValue)
    }

    async fetch(url, options, defaultValue={}){
        try{
            const response = await this.limiter.schedule(() => fetch(url, options).then((r) => r.json()))
            if ('success' in response && response['success'] == false){
                let logData = {code: response.errors[0].code, msg: response.errors[0].message}
                objlog(`Cloudflare API Request Failed ${options.method} ${url}`, logData)
                return defaultValue;
            } else {
                cflog(`Cloudflare API Request Succeeded  ${options.method} ${url}`)    
                return response
            }
        } catch (e){
            objlog(`Exception making Cloudflare API Call ${options.method} ${url}`, e);
            return defaultValue
        }
    }


}

module.exports = CloudflareAPI