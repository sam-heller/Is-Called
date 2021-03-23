const fs = require('fs')
const nunjucks = require('nunjucks');
const unsplash = require('unsplash-js')
const minify = require('html-minifier').minify
const CloudflareAPI = require('../../lib/CloudflareAPI')
const Bottleneck = require('bottleneck')

class TemplateBuilder {
    unsplash_available = false
    constructor(){
        nunjucks.configure(process.cwd() + '/build/templates')
        this.unsplash = unsplash.createApi({accessKey: process.env.UNSPLASH_KEY, fetch: fetch})
        this.cloudflare = new CloudflareAPI()
        this.limiter = new Bottleneck({minTime: 1000,maxConcurrent: 1});
    }

    async go(){
        let data = JSON.parse(fs.readFileSync('build/data/animals.json'));
        await this.buildDetailPages(data)
    }

    async buildDetailPages(data){
        for (let entry of data){
            let values = {animal: Object.keys(entry.animal)[0],tags: []}
            values.img = await(this.getImage(values.animal))
            values.plural = values.animal.pluralize()
            values.connector = values.animal.length == values.plural.length ? 'are' : 'is'
            for  (let type of ['group', 'male', 'female', 'infant', 'meat']){
                try {
                     await this.limiter.schedule(() => this.renderAndStoreDetailPage(entry, values, type))
                    this.build
                } catch (e){
                    objlog("Exception saving page", e)
                }
            }
        }
    } 

    async renderAndStoreDetailPage(entry, values, type){
        values.tags = [];
        for(let group of Object.keys(entry[type])){
            values.tags.push({name: group, sub: entry[type][group]})
        }
        let content = nunjucks.render('content/detail-card.njk',values)
        content = minify(content, {minifyCSS: true, minifyJS: true, collapseWhitespace: true, removeComments: true})
        this.cloudflare.putValue(`${values.animal}.${type}.iscalled.com`, content, 'content', false);
    }

    async getImage(animal){
        let images = await this.cloudflare.getValue(`${animal}.images`, 'data', []);
        if (images.length == 0 && this.unsplash_available){
            if (this.unsplash_available){
                try {
                    const result = await this.unsplash.search.getPhotos({query: animal, per_page: 30})
                    let images = result.response.results.map((d) => {return {user_name: d.user.name, user_href: d.user.links.html, img_url:d.urls.raw}})
                    await this.cloudflare.putValue(`${animal}.images`, images, 'data')
                } catch (e){
                    objlog("Error loading images", e)
                }
            }
        }
        return images.random()
    }

}




module.exports = TemplateBuilder;