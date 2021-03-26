require('../dist/lib/LoadConfig')
const Secrets = require('./tasks/Secrets')
const DataParser = require('./tasks/DataParser');
const CloudflareUpdater = require('./tasks/CloudflareUpdater')
// const TemplateBuilder = require('./tasks/TemplateBuilder')
const api = require('../dist/lib/RandomAPIS')
const CloudflareAPI = require('../dist/lib/CloudflareAPI');

class Setup {
    async run(job){
        let response = new Response('failed', {})
        switch(job){
            case 'build_data'      : response = await new DataParser().go();            break;
            case 'save_data'       : response = await new CloudflareUpdater().go();     break;
            case 'build_templates' : response = await new TemplateBuilder().go();       break;
            case 'save_secrets'    : response = await new Secrets().go();               break;
            case 'image_update'    : await this.rebuild();                   break;
            case 'all'             : await this.runAll();                    break;
            default: console.log(`Unknown step ${job}`); await this.test();  break;
        }
        console.log("Response from job is ", response, await response.text())
    }

    async runAll(){
        await this.run('save_secrets');
        await this.run('build_data');
        await this.run('save_data');
        await this.run('build_templates');
    }

    async rebuild(){
        const cf2 = new CloudflareAPI()
        const animals = await cf2.getValue('animals', 'data')
        for (let key of animals){
            console.log(key, await cf2.putValue(`${key}.images`, await this.unsplash(key), 'data'))
            obj
        }
    }

    async unsplash(key){
        try {
            const cfapi = new CloudflareAPI()            
            const existing = await cfapi.getValue(`${key}.images`, 'data', [])
            const newfields = {source: 'unsplash',match: 0,no_match: 0,verified: false}
            for (let e of Object.keys(existing)){
                try {
                    existing[e] = Object.assign(existing[e], newfields)
                } catch (err){console.log(err ,' on ', e)}
            }
            const divweb = await this.diversityWeb(key)
            let updated = existing.concat(divweb)
            const wikipedia = await this.wikipedia(key)
            updated = updated.concat(wikipedia);
            return updated
            
        } catch (error) {console.log('cfUpdate', error);}        
    }

    async diversityWeb(key){
        try {return await api.diversityWeb.images(key)} 
        catch (e){console.log('diversitySort', e); return []}
    }
    async wikipedia(key){
        try {return await api.wikipedia.images(key)}
        catch(e){console.log('wikipedia load', e); return [];}
    }
}


new Setup().run(process.argv[2])

