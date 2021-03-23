import '../lib/over-engineering'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
const unsplash = require('unsplash-js')

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

async function handleRequest(event) {
    let animalName = new URL(event.request.url).host.split('.')[0]
    if (animalName in ['what', 'iscalled']){return await listPage(event)}
    return await getAssetFromKV(event, {})
}

async function animalPage(event, animalName, type){
  return new Response(JSON.stringify('//@TODO'), {})
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

async function cacheImage(animal){
  let api = unsplash.createApi({accessKey: UNSPLASH_KEY})
  try {
      const result = await api.search.getPhotos({query: animal, per_page: 30})
      let images = result.response.results.map((d) => {return {user_name: d.user.name, user_href: d.user.links.html, img_url:d.urls.raw}})
      await CALLED.put(`${animal}.images`, images)
  } catch (e){
      objlog("Error loading images", e)
  }
}


class InnerContentHandler {
  constructor(contentString){this.contentString = contentString}
  element(element){element.setInnerContent(this.contentString)}
}


class DeleteElementHandler{
  element(element){element.remove()}
}


