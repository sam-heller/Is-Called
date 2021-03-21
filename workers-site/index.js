import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import pluralize from 'pluralize'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const url = new URL(event.request.url)
  if (url.pathname === '/json'){return await returnData(url.host);}
  return await returnAsset(event);
}

async function returnData(host){
  let key = host.split('.').slice(0,2).join('.')
  let names = await CALLED.get(key);
  names = {title: getTypeString(key.split('.')), names: JSON.parse(names)}
  return new Response(JSON.stringify(names),{headers: {'content-type' : 'application/json'}});
}

async function returnAsset(event) {
  const page = await getAssetFromKV(event, {})
  const response = new Response(page.body, page)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'unsafe-url')
  response.headers.set('Feature-Policy', 'none')
  return response

}

function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTypeString(from){
  let animalString = capitalize(from[0]);
  let type = from[1]
  let connectorString = from[0].length === animalString.length ? 'are' : 'is';
  switch (type){
    case 'group':
      return `A Group of ${pluralize(animalString)} ${connectorString} called`
    case 'meat':
      return `Meat from a ${animalString} is called`
    case 'female':
      return `A Female ${animalString} is called`
    case 'male':
      return `A Male ${animalString} is called`
    case 'infant':
      return `An Infant ${animalString} is called`
    default:
      return `I don't know anything about ${animalString} ${type}`
  }
}
