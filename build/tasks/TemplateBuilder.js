const fs = require('fs')
const nunjucks = require('nunjucks');
const unsplash = require('unsplash-js')
const minify = require('html-minifier').minify
const CloudflareAPI = require('../../lib/CloudflareAPI')
require('../../lib/over-engineering')
class TemplateBuilder {
    unsplash_available = false
    
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
            values.images = await(this.getImages(values.animal))
            values.plural = values.animal.pluralize()
            values.connector = values.animal.length == values.plural.length ? 'are' : 'is'
            for  (let type of ['group', 'male', 'female', 'infant', 'meat']){
                values.tags = [];
                for(let group of Object.keys(entry[type])){
                    values.tags.push({name: group, sub: entry[type][group]})
                }
                values.type = type                                     
                let infoCard = await this.renderInfoCard(entry, values, type)
                let infoPage = await this.renderPage({content: infoCard, entry: entry})
                if (cloudflare_out){pages.append({key: `${values.animal}.${type}`, page: infoPage})}
                if (file_out){
                     await fs.writeFileSync(process.cwd() + `/public/detail-pages/${values.animal.replace(' ', '-')}.${type}.html`, infoPage)
                }
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

    async getImages(animal, first_run=true){
        let images = await this.cloudflare.getValue(`${animal}.images`, 'data', []);
        if (images.length == 0 && this.unsplash_available){
            try {
                let query = `${animal} animal`
                const result = await this.unsplash.search.getPhotos({query: query, per_page: 30})
                let images = result.response.results.map((d) => {return {id: d.id, alt: image_alt, image_categories: categories, user_name: d.user.name, user_href: d.user.links.html, img_url:d.urls.raw}})
                if (images.length !== 0){
                    await this.cloudflare.putValue(`${animal}.images`, images, 'data')
                }   
                objlog('images retrieved', images)
                if (first_run){
                    return await this.getImages(animal, false)
                }
            } catch (e){
                objlog("Error loading images", e)
            }
        }
        return images
    }

}




module.exports = TemplateBuilder;