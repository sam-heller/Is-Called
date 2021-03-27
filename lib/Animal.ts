import {get, is,isNot} from './Utility'
const fs = require('fs')
const csv = require('csv-parser');

enum AnimalLink {
    redirect,
    reference
}

enum NameType{
    animal,
    infant,
    female,
    male,
    group,
    meat
}


type nameObj = {
    name:Name,
    context:string,
    full:string,
    type:NameType,
    class:string,
    slug:string
}

type AnimalRow = {
    animal: string,
    infant:string,
    female:string,
    male:string,
    group:string,
    meat:string,
    reference:string,
    redirect:string,
    slug:string
}


class Link{
    constructor(public type:AnimalLink, public target:Name ){}

    cerealize(toString=true){
        if (is.undefined(this.target)){return toString ? "" : {}}
        if (toString){
            if (this.type === AnimalLink.redirect) {
               return "Redirect To " + this.target.toString()
           } else {
               return "Also See " + this.target.toString()
           }
       } else {
            return {
                target: this.target.toString(),
                type: AnimalLink[this.type],
                class: get.className(this)
            }
        }
    }
}

class Name {
    public context:string = ""
    constructor(public type:NameType, public name:string){
        let extracted = name.split('(', )
        if ( extracted.length == 2) {
            this.context = extracted[1].replace(')', '').trim()
        }
        this.name = extracted[0]
    }
    slug():string{
        return this.name.replace(' ', '-')
    }
    toString():string{
        if (is.empty(this.context)){
            return this.name.trim()
        }
        return this.name.trim() + ' ('+ this.context.trim() + ')';
    }
    toObj():Object{
        return{
            name: this.name,
            context: this.context,
            full: this.toString(),
            type: NameType[this.type],
            class: get.className(this),
            slug: this.slug()
        }
    }
}

class Names implements IterableIterator<Name> {
    private ptr = 0;
    constructor(public type: NameType, public names: Name[] = []) {}
    public next(): IteratorResult<Name>{
        if (this.ptr < this.names.length){return {done:false, value:this.names[this.ptr++]}}
        else {return {done: true, value:null}}
    }
    [Symbol.iterator](): IterableIterator<Name> {return this;}
    public gs(names:string[]=[]){
        names.filter( (n)=> isNot('empty', n))
        for (let name of names){
            this.names.push(new Name(this.type, name))
        }
        return this.names
    }
    toString():string {
        // @ts-ignore
        return this.cerealize().join('||')
    }

    cerealize(toString=true):Array<string>|Object {
        let cereal = [];
        if (toString){
            for(let n of this.names) {cereal.push(n.toString())}
            return cereal
        }else {
            for(let n of this.names) {cereal.push(n.toObj())}
            return {
                class: get.className(this),
                type: NameType[this.type],
                items: cereal
            }
        }
    }
}


class Animal {
    public  animal:Name
    private infant:Names   = new Names(NameType.infant)
    private female:Names   = new Names(NameType.female)
    private male:  Names   = new Names(NameType.male)
    private group: Names   = new Names(NameType.group)
    private meat:  Names   = new Names(NameType.meat)
    private reference?:Link
    private redirect?:Link

    public constructor(name:string){
        this.animal = new Name(NameType.animal, name)
    }
    public infants(names:string[] = []){return this.infant.gs(names)}
    public females(names:string[] = []){return this.female.gs(names)}
    public males(names:string[] = []){return this.male.gs(names)}
    public groups(names:string[] = []){return this.group.gs(names)}
    public meats(names:string[] = []){return this.meat.gs(names)}
    public redirects(target?:string){
        if (target){
            this.redirect = new Link(AnimalLink.redirect, new Name(NameType.animal, target))
        }
        return this.redirect
    }
    public references(target?:string){
        if (target){
            this.reference = new Link(AnimalLink.reference, new Name(NameType.animal, target))
        }
        return this.reference
    }

    public cerealize(toString = true){
        let cereal = {}
        for (let k of Reflect.ownKeys(this)){
            if (Reflect.has(Reflect.get(this, k), 'cerealize')){
                Reflect.set(cereal, k, Reflect.get(this, k).cerealize(false))
            }
        }
        return {
            name: this.animal.toObj(),
            class: get.className(this),
            data: cereal
        }
    }

    public toJson(pretty = true){
        if(pretty){
            return JSON.stringify(this.cerealize(false), null, 1)
        } else {
            return JSON.stringify(this.cerealize(false))
        }

    }
}

class Hydrator {

    public fromCSV(fileName:string){
        const animals:string[] = [];
        const csvAnimals:Animal[] = []
        return fs.createReadStream(fileName)
            .pipe(csv())
            .on('data', (row:AnimalRow) => {

                if( row.animal.length > 0) {
                    let current = new Animal(row.animal)
                    current.infants(this.parseCell(row.infant))
                    current.females(this.parseCell(row.female))
                    current.males(this.parseCell(row.male))
                    current.groups(this.parseCell(row.group))
                    current.meats(this.parseCell(row.meat))
                    current.references(is.empty(row.reference) ? '' : row.reference)
                    current.redirects(is.empty(row.redirect) ? '' : row.redirect)
                    animals.push(current.toJson(false))
                    csv.csvAnimals(current)
                }

            })
            .on('end', () => {

                fs.writeFileSync('build/data/animals-two.json', '[' + animals.join(',') +']')
                let csvData = [['animal','infant','female','male','group','meat','reference','redirect','slug'].join(',')]
                for(let row of csvAnimals){
                    let data = row.cerealize(false)
                    console.log(data)
                    let temp:AnimalRow = {
                        // @ts-ignore
                        name: data.name.name,
                        // @ts-ignore


                    }
                }
            })
    }

    public parseCell(rowData:string){
        if (is.empty(rowData)){return [];}
        return rowData.split('||')
    }

    public fromJson(json:string):Object|null {
        let data = JSON.parse(json)
        switch(data['class'].toLowerCase()){
            case 'animal' : return this.parseAnimal(data);
            default: return null;
        }
    }

    private parseAnimal(data:object):Object|null{
        let name = get.byKey(data, 'name', {name:false});
        if (name.name !== false){
            let animal = new Animal(name.name)
            let animalData = get.byKey(data, 'data', {})
            for (let key of Object.keys(animalData)){
                let current = get.byKey(animalData, key, {class: 'none', items:[]})
                switch(current.class){
                    case 'Names':
                        let namesArray = current.items.map((curr:nameObj) => curr.full)
                        switch(current.type){
                            case 'infant': animal.infants(namesArray); break;
                            case 'male': animal.males(namesArray); break;
                            case 'female': animal.females(namesArray); break;
                            case 'group': animal.groups(namesArray); break;
                            case 'meat': animal.meats(namesArray); break;
                            default: break;
                        }
                    break;
                    case 'Link':
                        console.log('link', current.type, )
                        switch (current.type){
                            case AnimalLink[AnimalLink.redirect]: animal.redirects(current.target); break
                            case AnimalLink[AnimalLink.reference]: animal.redirects(current.target.toString()); break
                            default: break;
                        }
                   }
                }
                return animal
            }
        return null;
    }
}
