
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

class MetadataHandler {

    constructor(typeString, url , data){
        this.typeString = typeString
        this.url = url
        this.data = data
    }

    element(element){
        switch(element.getAttribute('property')){
            case 'og:site_name' : element.setAttribute('content', 'Is Called'); break;
            case 'og:title' : element.setAttribute('content', `${this.typeString} a ${Object.keys(this.data).join(', ')}`); break;
            case 'og:description' : element.setAttribute('content', `${this.typeString} a ${Object.keys(this.data).join(', ')}`); break;
            case 'og:url' : element.setAttribute('content', this.url); break;
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

export {DataElementHandler, ListingElementHandler, MetadataHandler, JsonLdHandler, DeleteElementHandler, InnerContentHandler}