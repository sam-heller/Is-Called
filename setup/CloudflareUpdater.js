const fs = require('fs');
const fetch = require('node-fetch');

/**
 * Class responsible for updating cloudflare records
 */
 class CloudflareUpdater {
    animals;
    config;
    kvOptions;
    kvTarget;

    constructor(config) {
        this.config = config;
        this.animals = JSON.parse(fs.readFileSync(this.config['json_out']), 'utf-8');
        this.kvTarget = this.config['cloudflare']['kv']['target']
            .replace(':account', this.config['cloudflare']['accountId'])
            .replace(':namespace', this.config['cloudflare']['kv']['namespaceId'])
        this.kvOptions = {
            method: 'PUT',
            headers: {
                "X-Auth-Email": this.config['cloudflare']['email'],
                "X-Auth-Key": this.config['cloudflare']['key'],
                "Content-Type": 'application/json'
            },
            body: ''
        }
    }

    writeBulk(values) {
        this.kvOptions.body = values;
        return fetch(this.kvTarget, this.kvOptions)
            .then(res => res.json())
            .then(json => console.log(`response setting bulk values : `, json))
    }

    async writeKeystore() {
        let toData = [];
        for (let entry of this.animals) {
            for (let name of Object.keys(entry.animal)) {
                toData.push({key: `${name}.young`, value: JSON.stringify(entry.young)});
                toData.push({key: `${name}.female`, value: JSON.stringify(entry.female)});
                toData.push({key: `${name}.male`, value: JSON.stringify(entry.male)});
                toData.push({key: `${name}.group`, value: JSON.stringify(entry.group)});
                toData.push({key: `${name}.meat`, value: JSON.stringify(entry.meat)});
            }
        }

        toData = JSON.stringify(toData);
        return await(this.writeBulk(toData))
    }
}

module.exports = CloudflareUpdater