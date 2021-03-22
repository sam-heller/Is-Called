
class DataElementHandler {
    constructor(data){
        this.data = data
    }
    element(element){
        let content = ''
        for (let name in this.data){
            if (this.data[name] === ""){content += `<span class="tag is-large">${name}</span>\n`}
            else {content += `<span class="tag is-large">${name} (${this.data[name]})</span>\n`}
        }
        if(Object.values(this.data).length === 0){
            content += "<span class='tag is-large'>🤷 I don't know this one either 🤷</span>"
        }
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

class MetadataHandler {
    constructor(typeString, url , data, image){
        this.typeString = typeString
        this.url = url
        this.data = data
        this.image = image !== null ? image.img_url : ''
    }

    element(element){
        switch(element.getAttribute('property')){
            case 'og:site_name' : element.setAttribute('content', 'Is Called'); break;
            case 'og:title' : element.setAttribute('content', `${this.typeString} a ${Object.keys(this.data).join(', ')}`); break;
            case 'og:description' : element.setAttribute('content', `${this.typeString} a ${Object.keys(this.data).join(', ')}`); break;
            case 'og:url' : element.setAttribute('content', this.url + "&w=256"); break;
            case 'og:image' : element.setAttribute('content', this.image); break;
            case 'article:published_time' : element.setAttribute('content', '2021-03-21T08:00:00.000Z'); break;
        }
    }
}

class JsonLdHandler {
    constructor(typeString, animal, type, names){
        this.data = {
            "@context": "https://schema.org",
            "@type": "Article",
            "author": {"@type": "Person", "name": "Sam Heller", "url": "https://www.github.com/sam-heller/",},
            "headline": `${typeString} a ${Object.keys(names).join(', ')}`,
            "url": `http://${animal}.${type}.iscalled.com`,
            "datePublished": "2021-03-21T08:00:00.000Z",
            "description": `${typeString} a ${Object.keys(names).join(', ')}`,
            "mainEntityOfPage": {"@type": "WebPage", "@id": "http://what.iscalled.com/"}
        }
    }

    element(element){
        element.setInnerContent(JSON.stringify(this.data, null, 2));
    }
}



class UnsplashImageHandler {
    constructor(image){
        this.image_data = image
    }

    async element(element){
        if (this.image_data !== null){
            let size = element.getAttribute('data-size')
            let src = this.getSizedSrc(this.image_data, size)
            element.setAttribute('src', src);
            element.setAttribute('data-attribution-name', this.image_data.user_name)
            element.setAttribute('data-attribution-url', this.image_data.user_url)
            element.after(`<figcaption class="is-size-7 has-text-weight-light is-italic">Photo by <a href="${this.image_data.user_url}?utm_source=is_called&utm_medium=referral">${this.image_data.user_name}</a> on <a href="https://unsplash.com/?utm_source=is_called&utm_medium=referral">Unsplash</a></figcaption>`, {html: true})
        }

    }

    getSizedSrc(image, size){
        return `${image.img_url}&w=${size}&dp=2`
    }
}

class InnerContentHandler {
    constructor(contentString){
        this.contentString = contentString
    }

    element(element){
        element.setInnerContent(this.contentString)
    }
}


class DeleteElementHandler{
    element(element){
        element.remove()
    }
}

export {DataElementHandler, ListingElementHandler, MetadataHandler, JsonLdHandler, DeleteElementHandler, InnerContentHandler, UnsplashImageHandler}