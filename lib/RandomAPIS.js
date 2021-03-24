const wiki = require('wikipedia')
const Bottleneck = require('bottleneck');
const createHtmlDom = require('htmldom');
const { images } = require('wikipedia/dist/page');

const RequestType = {
    is(type){return Object.assign({}, this[type]).request},
    html: {
        async request(url){
            try {return createHtmlDom(await this.limiter.schedule(() => fetch(url).then((resp) =>(resp.text()))))} 
            catch(e){console.log(e)}
        }
    },
    json: {
        async request(url){
            try{return await this.limiter.schedule(() => fetch(url).then((resp) =>(resp.json())))}
            catch(e){console.log(e)}
        }
    }
}


const RandomAPIS = {

    wikipedia: {
        limiter: new Bottleneck({minTime: 500, maxConcurrent:1}),
        request: RequestType.is('json'),
        async page(name){return await this.request('https://en.wikipedia.org/api/rest_v1/page/summary/' + name)},
        async images(name){
            let files = await this.request('https://en.wikipedia.org/api/rest_v1/page/media-list/' + name)
            files = files.items.filter((f) => f.type == 'image')
            this.request = RequestType.is('html')
            let images = []
            for (let f of files){
                images.push(await this.imageData(f))
            }
            this.request.RequestType.is('json')
            return images
        },
        async imageData(f){
            try {
                let img = {
                    id: f.title,
                    link: f.srcset[0].src,
                    downloaded: false,
                    source: 'wikipedia',
                    match:  0,
                    no_match:  0,
                    verified: false
                }
                let $ = await this.request(`https://commons.wikimedia.org/wiki/${f.title}`)
                if ($('script[type="application/ld+json"]').length == 1){
                    img.license = JSON.parse($('script[type="application/ld+json"]')[0].textContent)
                }
                return img;
            } catch (e){console.log('wikipedia fike', e); return img;}
        }
    },

    diversityWeb: {
        limiter: new Bottleneck({minTime: 500, maxConcurrent:1}),
        request: RequestType.is('html'),
        host: 'http://animaldiversity.org', 
        async images(term, grabFirst = true){
            const images = []
            let $ = await this.request( `${this.host}/search/?q=${term}&feature=INFORMATION`)
            $ = await this.request(`${this.host}${$('div.result a').eq(0).attr('href')}`)
            $ = await this.request(`${this.host}${$('#feature-pictures').attr('href')}`)
            for (let page of $('div.thumbnail a.rewrite')){
                $ = await this.request(`${this.host}${page.attributes.href}`)
                images.push(this.imageData($, `${this.host}${page.attributes.href}`))
            }
            return images
        },
        imageData($, src){
            let data = {downloaded: false, page: src}
            try {
                data.imageUrl     = $('img.resource')[0].attributes.src
                data.contributor  =  $('section.metadata').find('div.block').find('p').html()
                data.license_link = $('a[rel=license]').eq(-1)[0].attributes.href
                data.license_text = $('a[rel=license]').eq(-1)[0].children[0].data
                return data
            } catch (e){
                console.log(e, data)
                return data
            }
        }

    }


}


module.exports = RandomAPIS