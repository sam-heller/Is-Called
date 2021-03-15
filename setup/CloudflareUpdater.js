const fs = require('fs');
/**
 * Class responsible for updating cloudflare records
 */
 class CloudflareUpdater {
    animals;
    cfClient;

    constructor(config){
        this.animals = JSON.parse(fs.readFileSync(config['json_out']), 'utf-8');
        this.cfClient = require('cloudflare')({
            email: config['cloudflare']['email'],
            key: config['cloudflare']['key']
        });
    }

    clearAndBuildTextRecords(){
        console.log('todo');
    }
}

module.exports = CloudflareUpdater