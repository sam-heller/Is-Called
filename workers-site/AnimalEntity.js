
class AnimalEntity{

    construct(animalName, cache){
        this.name = animalName
        this.cache = cache
        this.images = []
    }

    async buildFor(type){
        await this.loadImages()
        switch(type){

        }
    }

    async loadImages(){
        const raw = await this.cache.get(`${this.name}.images`)
        if (raw !== null){
            this.images = JSON.parse(raw)
        }
    }

}


export {AnimalEntity}