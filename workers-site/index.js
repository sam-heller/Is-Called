import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import {DataElementHandler, ListingElementHandler, MetadataHandler, JsonLdHandler, DeleteElementHandler, InnerContentHandler, UnsplashImageHandler} from "./HtmlRewriteHandlers"
import pluralize from 'pluralize'
import './DubiousPrototypeAdditions'
addEventListener('fetch', event => {
  console.log("eventListener", event)
  event.respondWith(handleRequest(event))
})

addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled(event))
})

async function handleScheduled(event){
  const keys = await IMG_QUEUE.list()
  for (let k of Object.values(keys)){
    event.waitUntil(cacheImage(k))
  }
}

async function cacheImage(animal){
  try {
    await IMG_QUEUE.delete(k)
    let url = `https://api.unsplash.com/search/photos?per_page=50&page=1&query=${animal}`
    let options = {headers: {"Authorization" : `Client-ID ${UNSPLASH_KEY}`}}
    console.log("Starting Fetch", url, options)
    const response = await fetch(url, options);
    console.log("Respoonse retrieved", response);
    const raw = await response.json()
    console.log("Response json parsed", raw)
    const result = JSON.parse(raw)
    console.log("Image results", result)
    let images = []
    for (let i of result.results){
      images.push({'img_url': i['urls']['raw'], 'user_name': i['user']['name'], 'user_url': i['user']['links']['html']})
    }
    console.log("Images parsed", images);
    return CALLED.put(`${animal}.images`, JSON.stringify(images))
  } catch (e){console.log("Fetch of image failed")}
}


async function handleRequest(event) {
  const request = event.request
  const cacheUrl = new URL(request.url)
  const cacheKey = new Request(cacheUrl.toString(), request)
  const cache = caches.default
  let response = await cache.match(cacheKey)
  if (!response || true) {
    response = await handleUncached(event)
    response.headers.append("Cache-Control", "s-maxage=60")
    event.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}

async function handleUncached(event){
  const keys = new URL(event.request.url).host.split('.').slice(0,2)
       if (event.request.url.endsWith('.png')){return await getAssetFromKV(event, {})}
  else if (event.request.url.endsWith('.gif')){return await getAssetFromKV(event, {})}
  else if (event.request.url.endsWith('robots.txt')){return new Response('Sitemap: http://what.iscalled.com/sitemap.txt', {})}
  else if (event.request.url.endsWith('sitemap.txt')){return await sitemapText()}
  else if (event.request.url.endsWith('sitemap.xml')){return await sitemapXml()}
  else if (keys[0] === 'what'){return await listPage(event);}
  else {return await infoPage(event, keys);}
}

async function listPage(event){
  const data = JSON.parse(await CALLED.get('animals'))
  const page = await getAssetFromKV(event, {})
  return new HTMLRewriter()
      .on('title', new InnerContentHandler('Types of Things'))
      .on('#title', new InnerContentHandler('Tell me about'))
      .on('#content', new ListingElementHandler(data))
      .on('meta[property]', new DeleteElementHandler())
      .on('#jsonld', new DeleteElementHandler())
      .transform(page)
}

async function infoPage(event, keys){
  const data = JSON.parse(await CALLED.get(keys.join('.').replace('-', ' ')))
  const page = await getAssetFromKV(event, {})
  const typeString = getTypeString(keys[1], keys[0])
  const image = await getImage(keys[0]);
  return new HTMLRewriter()
      .on('title', new InnerContentHandler(typeString))
      .on("#title", new InnerContentHandler(typeString))
      .on("#content", new DataElementHandler(data))
      .on('#jsonld', new JsonLdHandler(typeString, keys[0], keys[1], data))
      .on("meta", new MetadataHandler(typeString, event.request.url, data, image))
      .on('img', new UnsplashImageHandler(image))
      .transform(page)
}

async function getImage(animal){
  const cached = await CALLED.get(`${animal}.images`)
  if (cached !== null){
    return JSON.parse(cached).random()
  } else {
    await IMG_QUEUE.put(animal, animal)
  }
  return cached;
}

async function sitemapText(){
  let names = JSON.parse(await CALLED.get('animals'));
  let text = "http://what.iscalled.com\n"
  for (let name of names){
    for (let type of ['group', 'meat', 'female', 'male', 'infant']){
      text += `http://${name.replace(' ', '-')}.${type}.iscalled.com\n`
    }
  }
  return new Response(text, {})
}

async function sitemapXml(){
  let names = JSON.parse(await CALLED.get('animals'));
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  xml += `<url>\n\t<loc>http://what.iscalled.com</loc>\n</url>\n`
  for (let name of names){
    for (let type of ['group', 'meat', 'female', 'male', 'infant']){
      xml += `<url>\n\t<loc>http://${name.replace(' ', '-')}.${type}.iscalled.com</loc>\n</url>\n`
    }
  }
  xml += '</urlset>'
  return new Response(xml, {});
}



async function getCachedJson(key, onFail={}){
  console.log("Retrieving key " + key)
  try {
    const raw = await CALLED.get(key);
    if (raw === null){
      return onFail
    }
    return JSON.parse(raw)
  } catch (e){
    return onFail
  }
}

function getTypeString(type, animal){
  let animalCap = animal.charAt(0).toUpperCase() + animal.slice(1).replace('-', ' ')
  let animalString = pluralize(animalCap)
  let connectorString = animal.length === animalString.length ? 'are' : 'is';
  switch (type){
    case 'group': return `A Group of ${animalString} ${connectorString} called`
    case 'meat': return `Meat from a ${animalCap} is called`
    case 'female': return `A Female ${animalCap} is called`
    case 'male': return `A Male ${animalCap} is called`
    case 'infant': return `An Infant ${animalCap} is called`
    default: return `I don't know anything about ${animalString} ${type}`
  }
}

