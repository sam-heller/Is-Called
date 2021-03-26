import {ApiBase} from './ApiBase'
import {is} from './Utility'
import {ImageResponseData} from '../types'

class WikipediaAPI extends ApiBase
{
    pageEndpoint:string = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
    mediaEndpoint:string = 'https://en.wikipedia.org/api/rest_v1/page/media-list/';

    constructor(){
        super(500, 1)
    }

    async page(name:string):Promise<Object>
    {
        return await super.requestJson(`${this.pageEndpoint}${name}`)
    }

    async images(name:string)
    {
        let response = await this.requestJson(`${this.mediaEndpoint}${name}`)
        let files = response.get('items').filter((file:Map<string,string>) => file.get('type') == 'image')
        let images = []
        for (let imageData of files){
            
            let currentImage = await this.image(imageData);
            if (is.object(currentImage)){
                images.push(currentImage)
            }
            
        }
        return images
    }

    async image(imageData:ImageResponseData)
    {
        try {
            let $ = await super.requestHtml(`https://commons.wikimedia.org/wiki/${imageData.get('title')}`)
            if ($ !== null){
                if ($('script[type="application/ld+json"]').length == 1){
                    imageData.set('license', $('script[type="application/ld+json"]')[0].textContent)
                }
            }
            return imageData;
        } catch (e){
            console.log('wikipedia fail', e);
            return false;
        }
    }
}

export{WikipediaAPI}