import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { ApiResponse } from 'unsplash-js/dist/helpers/response'
import { Photos } from 'unsplash-js/dist/methods/search/types/response'
import unsplash from 'unsplash-js'
import {objlog, get} from '../lib/Utility'


addEventListener('fetch', event => {
  console.log("eventListener", event)
  try {event.respondWith(handleRequest(event))} 
  catch (error){
    console.error(error.message, error.stack)
    event.respondWith(new Response("Uhoh!", {status: 500}))
  }
})

addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled(event))
})

async function handleScheduled(event:ScheduledEvent):Promise<void>
{
  const response = await IMG_QUEUE.list()
  for (let k of Object.values(response.keys)){
    event.waitUntil(cacheImage(k.name))
  }
}

async function handleRequest(event:FetchEvent):Promise<Response> 
{
    let url = new URL(event.request.url);
    let hostname = url.hostname
    //Check to see if name/type is passed via query param (local dev)
    if (url.searchParams.get('n') || false !== false){
      let hostParts = url.hostname.split('.')
      hostParts[0] = url.searchParams.get('n') || "bear"
      hostParts[1] = url.searchParams.get('t') || "group"
      hostname = hostParts.join('.')
    } 

    console.log("Request is to", hostname, url.pathname, url.searchParams)
    //Handle robots request
    if (['/robots.txt', '/sitemap.xml', '/sitemap.txt'].includes(url.pathname)){
      let requested = url.pathname.replace('/', '').split('.')
      if (requested[0] === 'robots'){return await robots(hostname || 'what.iscalled.com')} 
      if (requested[0] === 'sitemap'){return await sitemap(requested[1]||"txt", hostname)}
    }
    
    //Check if on root domain, display listing page
    let animalName = hostname.split('.')[0]
    if (animalName in ['what', 'iscalled']){
      return await listPage(event)
    }

    //Check if calling root of domain, if so generate animal page
    if (url.pathname === '/'){
      let type = hostname.split('.')[1]
      return animalPage(event, animalName, type)
    }
    
    //If nothing else matches, attempt retrieving cached content
    return await getAssetFromKV(event, {})
}

async function robots(hostname:string):Promise<Response>
{
  return new Response(`Sitemap: http://${hostname}/sitemap.txt`, {})
}

async function sitemap(type:string, hostname:string):Promise<Response>
{
  const headers = {headers:{"Content-Type" : type === "xml" ? "application/xml;charset=UTF-8": "text/plain;charset=UTF-8"}}
  const cached = await __STATIC_CONTENT.get(`${hostname}/sitemap.${type}`, {headers: headers}, "text") || "empty"
  if (cached !== "empty"){return new Response(cached, headers)}
  let sitemap = type === "xml" ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` : "";
  if(hostname.startsWith('what') || hostname.startsWith('iscalled') || hostname.startsWith('is-called')){
    sitemap += type === "xml" ? `\n\t<url>\n\t\t<loc>http://what.iscalled.com</loc>\n\t</url>` : `\nhttp://what.iscalled.com/`
    const animals:[string] =  await CALLED.get("animals",  "json") || [""]
    for(let animal of Object.entries(animals)){
      let name = animal[0]
      for (let grouping of animal[1]){
          if (grouping != 'animal'){
            sitemap += type === "xml" ? `\n\t<url>\n\t\t<loc>http://${name}.${grouping}.iscalled.com</loc>\n\t</url>` : `\nhttp://${name}.${grouping}.iscalled.com`
          }
      }
    }
  } else {
    sitemap += type === "xml" ? `\n\t<url>\n\t\t<loc>http://${hostname}</loc>\n\t</url>` : `\nhttp://${hostname}`
  }
  sitemap += type === "xml" ? `\n</urlset>` : ""
  __STATIC_CONTENT.put(`${hostname}/sitemap.${type}`, sitemap, {expirationTtl: 1})
  return new Response(sitemap, headers)
}

async function animalPage(event:FetchEvent, animalName:string, type:string):Promise<Response>
{
  let animal = get.jsonMap(await CALLED.get(`${animalName}.${type}`));
  return new Response(get.jsonString(animal), {})
}

async function listPage(event:FetchEvent):Promise<Response>
{
  const page = await getAssetFromKV(event, {})
  return new HTMLRewriter()
      .on('title', new InnerContentHandler('Types of Things'))
      .on('#title', new InnerContentHandler('Tell me about'))
      // .on('#content', new ListingElementHandler(data))
      .on('meta[property]', new DeleteElementHandler())
      .on('#jsonld', new DeleteElementHandler())
      .transform(page)
}

async function cacheImage(animal:string){
  let api = unsplash.createApi({accessKey: process.env.UNSPLASH_KEY || ""})
  try {
      const result:ApiResponse<Photos> = await api.search.getPhotos({query: animal, perPage: 30})
      if (result.type === 'success'){
        let images = result.response.results.map((d) => {return {user_name: d.user.name, user_href: d.user.links.html, img_url:d.urls.raw}})
        await CALLED.put(`${animal}.images`, JSON.stringify(images))
      }
  } catch (e){
      objlog("Error loading images", e)
  }
}


class InnerContentHandler {
  contentString:string;
  constructor(contentString:string){this.contentString = contentString}
  element(element:Element){element.setInnerContent(this.contentString)}
}


class DeleteElementHandler{
  element(element:Element){element.remove()}
}


