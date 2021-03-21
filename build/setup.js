const DataParser = require('./DataParser');
const CloudflareUpdater = require('./CloudflareUpdater')
require('dotenv').config()

switch(process.argv[2]){
    case 'build_data' :
        let parser = new DataParser();
        parser.buildDataFile()
        break;
    case 'save_data' :
        let updater = new CloudflareUpdater();
        updater.writeKeystore();
        break;
    default:
        console.log(`Unknown step ${process.argv[2]}`)
        break;
}
