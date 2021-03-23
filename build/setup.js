require('../lib/LoadConfig')
require('../lib/over-engineering')
const Secrets = require('./tasks/Secrets')
const DataParser = require('./tasks/DataParser');
const CloudflareUpdater = require('./tasks/CloudflareUpdater')
const TemplateBuilder = require('./tasks/TemplateBuilder')
class Setup {
    async run(job){
        switch(job){
            case 'build_data'      : await new DataParser().go();        break;
            case 'save_data'       : await new CloudflareUpdater().go(); break;
            // case 'cache_warm'      : await new ImageCache().go();        break;
            case 'build_templates' : await new TemplateBuilder().go();   break;
            case 'save_secrets'    : await new Secrets().go();           break;
            case 'all'             : await this.runAll();                break;
            default: console.log(`Unknown step ${job}`);                 break;
        }
    }

    async runAll(){
        await this.run('save_secrets');
        await this.run('build_data');
        await this.run('save_data');
        await this.run('build_templates')        
    }
}

new Setup().run(process.argv[2])

