const fs = require('fs')
const nunjucks = require('nunjucks');
const unsplash = require('unsplash-js')
const minify = require('html-minifier').minify
const CloudflareAPI = require('../../lib/CloudflareAPI')
require('../../lib/over-engineering')
class TemplateBuilder {
    unsplash_available = true
    
    constructor(){
        nunjucks.configure(process.cwd() + '/build/templates', {autoescape: false})
        this.unsplash = unsplash.createApi({accessKey: process.env.UNSPLASH_KEY, fetch: fetch})
        this.cloudflare = new CloudflareAPI()
    }

    async go(){
        let data = JSON.parse(fs.readFileSync('build/data/animals.json'));
        await this.buildDetailPages(data)
    }

    async buildDetailPages(data, file_out=true, cloudflare_out=false){
        let pages = []
        for (let entry of data){
            let values = {animal: Object.keys(entry.animal)[0],tags: []}
            values.img = await(this.getImage(values.animal))
            values.plural = values.animal.pluralize()
            values.connector = values.animal.length == values.plural.length ? 'are' : 'is'
            for  (let type of ['group', 'male', 'female', 'infant', 'meat']){
                values.tags = [];
                for(let group of Object.keys(entry[type])){
                    values.tags.push({name: group, sub: entry[type][group]})
                }                                     
                let infoCard = await this.renderInfoCard(entry, values, type)
                let infoPage = await this.renderPage({content: infoCard, entry: entry})
                if (cloudflare_out){pages.append({key: `${values.animal}.${type}`, page: infoPage})}
                if (file_out){
                     fs.writeFileSync(process.cwd() + `/public/detail-pages/${values.animal}.${type}.html`, infoPage)
                }
                // console.log(infoPage);
            }
        }
    }

    async renderPage(data, minify=false){
        try {
            let content = await nunjucks.render('index.njk', data)
            if (minify){
                content = minify(content, {minifyCSS: true, minifyJS: true, collapseWhitespace: true, removeComments: true})
            }
            return content            
        } catch (e){
            objlog("Error rendering Detail component", e)
            return ""
        }
    }

    async renderInfoCard(entry, values, type, minify=false){
        try {
            let content = nunjucks.render('content/detail-card.njk', values)
            if (minify){
                content = minify(content, {minifyCSS: true, minifyJS: true, collapseWhitespace: true, removeComments: true})
            }
            return content
        } catch (e) {
            objlog("Error rendering Detail component", e)
            return ""
        }
        
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