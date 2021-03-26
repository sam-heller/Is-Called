declare module htmldom {}
import {HTMLDomNode} from '../types/htmldom'
import Bottleneck from "bottleneck"
import {createHtmlDom} from 'htmldom';


class ApiBase {
    limiter:Bottleneck;
    constructor(minTime:number = 500, maxConcurrent:number = 1){
        this.limiter = new Bottleneck({minTime: minTime, maxConcurrent: maxConcurrent})
    }

    async requestHtml(url:string):Promise<HTMLDomNode>
    {
        try {return createHtmlDom(await this.limiter.schedule(() => fetch(url).then((resp) =>(resp.text()))))} 
        catch(e){console.log(e);return createHtmlDom("");}
    }

    async requestJson(url:string):Promise<Map<string,any>>
    {
        try{
             let data = await this.limiter.schedule(() => fetch(url).then((resp) =>(resp.json())))
             return new Map(Object.entries(data))
        }
        catch(error:any){
            console.log('error', error.message);
            return new Map(Object.entries({type: 'error', message: error.message}));
        }
    }

}

class ApiImage{
    id:string;
    link:string = "";
    source:string = "";
    owner:string = "";
    license:string = "";
    license_url:string = ""
    license_text:string = ""
    downloaded:boolean = false;
    verified:boolean =  false;
    
    constructor(data:Map<string,any>){
        this.id = data.get('id') || ''
        this.link = data.get('link') || ""
        this.source = data.get('source') || ""
        this.owner = data.get('owner') || ""
        this.license = data.get('license') || ""
        this.license_url = data.get('license_url') || ""
        this.license_text = data.get('license_text') || ""   
    }
}


export {ApiBase, ApiImage}