const fs = require('fs');
const fetch = require('node-fetch');


class ImageCache {
    constructor(){
        this.getCaches = "https://api.cloudflare.com/client/v4/accounts/:account/storage/kv/namespaces/:namespace/"
            .replace(':account', process.env.ACCOUNT_ID)
            .replace(':namespace', process.env.IMAGE_QUEUE)

        this.dataCache ="https://api.cloudflare.com/client/v4/accounts/:account/storage/kv/namespaces/:namespace/"
            .replace(':account', process.env.ACCOUNT_ID)
            .replace(':namespace', process.env.NAMESPACE_ID_PROD)
        this.headers =  {
            "X-Auth-Email": process.env.API_EMAIL,
            "X-Auth-Key": process.env.API_TOKEN,
            "Content-Type": 'application/json'
        }
    }

    async go(){

        const response = await fetch(this.getCaches  + 'keys', {headers: this.headers})
        const keys = await response.json()
        for (let k of Object.values(keys.result)){
            const url = `https://api.unsplash.com/search/photos?per_page=50&page=1&query=`
            const options = {headers: {"Authorization" : `Client-ID ${process.env.UNSPLASH_KEY}`}}
            const usplash = await fetch(url + k.name, options)
            const uResults = await usplash.json()
            let images = []
            for (let i of uResults.results){
                images.push({'img_url': i['urls']['raw'], 'user_name': i['user']['name'], 'user_url': i['user']['links']['html']})
            }
            await this.saveImages(images, k.name)
            console.log("Images parsed for " + k.name);
        }




    }

    async saveImages(images, animal){
        let opts = {method: 'PUT', headers: this.headers, body: JSON.stringify(images)}
        const saveCache = await fetch(this.dataCache + 'values/' + animal+ '.images', opts)
        const cacheResults = await saveCache.json()
        console.log("Cache Saved?", cacheResults);

    }

    async cacheImage(animal){
        try {
            await IMG_QUEUE.delete(k)
            console.log("Starting Fetch", url, options)
            const response = await fetch(url, options);
            console.log("Respoonse retrieved", response);
            console.log("Response json parsed", raw)
            console.log("Image results", result)
            let images = []
            for (let i of result.results){
                images.push({'img_url': i['urls']['raw'], 'user_name': i['user']['name'], 'user_url': i['user']['links']['html']})
            }
            console.log("Images parsed", images);
            return CALLED.put(`${animal}.images`, JSON.stringify(images))
        } catch (e){console.log("Fetch of image failed")}
    }

}

module.exports = ImageCache