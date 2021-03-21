import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import pluralize from 'pluralize'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const request = event.request
  const cacheUrl = new URL(request.url)
  const cacheKey = new Request(cacheUrl.toString(), request)
  const cache = caches.default
  let response = await cache.match(cacheKey)
  if (!response) {
    response = await handleUncached(event)
    response.headers.append("Cache-Control", "s-maxage=3600")
    event.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}

async function handleUncached(event){
  const keys = new URL(event.request.url).host.split('.').slice(0,2)
  if (event.request.url.endsWith('.png')){return await getAssetFromKV(event, {})}
  if (keys[0] == 'what'){return await listPage(event);}
  else {return await infoPage(event, keys);}
}

async function listPage(event){
  const data = JSON.parse(await CALLED.get('animals'))
  const page = await getAssetFromKV(event, {})
  return new HTMLRewriter()
      .on('title', new TitleElementHandler('Types of Things'))
      .on('#title', new TitleElementHandler('Tell me about'))
      .on('#options-wrap', new ListingElementHandler(data))
      .transform(page)
}

async function infoPage(event, keys){
  const data = JSON.parse(await CALLED.get(keys.join('.')))
  const page = await getAssetFromKV(event, {})
  const typeString = getTypeString(keys[1], keys[0])
  return new HTMLRewriter()
      .on('title', new TitleElementHandler(typeString))
      .on("#title", new TitleElementHandler(typeString))
      .on("#content", new DataElementHandler(data))
      .transform(page)
}

function getTypeString(type, animal){
  let animalCap = animal.charAt(0).toUpperCase() + animal.slice(1)
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

class TitleElementHandler {
  constructor(typeString){
    this.typeString = typeString
  }
  element(element){
    element.setInnerContent(this.typeString)
  }
}

class DataElementHandler {
  constructor(data){
    this.data = data
  }
  element(element){
    let content = '<div class="column tags is-multiline is-centered" id="content">'
    for (let name in this.data){
      if (this.data[name] === ""){content += `<span class="tag is-large">${name}</span>\n`}
      else {content += `<span class="tag is-large">${name} (${this.data[name]})</span>\n`}
    }
    if(Object.values(this.data).length === 0){
      content += "<span class='tag is-large'>🤷 I don't know this one either 🤷</span>"
    }
    content += '</div>'
    element.setInnerContent(content, {html:true})
  }
}

class ListingElementHandler {
  constructor(data){
    this.data = data
  }
  element(element){
    let content = '<div class="select"><select id="animalSelect" onchange="buildLink()">';
    for (let d of this.data){content += `<option>${d}</option>`}
    content += "</select></div>"
    content += "<div class='select'><select id='typeSelect' onchange='buildLink()'>"
    for (let opt of ["group", "male", "female", "infant", "meat"]){
      content += `<option>${opt}</option>`
    }
    content += "</select></div>"
    element.setInnerContent(content, {html:true})
  }
}