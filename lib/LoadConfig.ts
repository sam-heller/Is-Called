const fs = require('fs')
const flatten = require('flat')
const toml = require('toml')
import {get} from './Utility'
require('dotenv').config()

 /**
  * @TODO Fix the assignAll and get this back to less kludgey
  */
 class LoadConfig{

    constructor(){
        this.loadConfig()      
    }

    loadConfig(){
        let config = toml.parse(fs.readFileSync('wrangler.toml'))
        let site   = get.andDelete(config, 'site'); delete(config['site']);
        let env    = get.andDelete(get.andDelete(config,'env'), process.env.ENVIRONMENT || ""); delete(config['env'])
        for (let ns of get.andDelete(env, 'kv_namespaces')){
            if (ns['binding'] == process.env.DATA_NAMESPACE_KEY){process.env.DATA_NAMESPACE_ID = '7efde571ad4a47eb864eca59f3b19273'}
            if (ns['binding'] == process.env.QUEUE_NAMESPACE_KEY){process.env.QUEUE_NAMESPACE_ID = ns['id']}
            if (ns['binding'] == process.env.CONTENT_NAMESPACE_KEY){process.env.CONTENT_NAMESPACE_ID = ns['id']}
        };
        env['site_name'] = get.andDelete(env,'name');delete(env['name'])
        env['routes'] = env.routes.join(',')
        env = flatten(env)
        config = flatten(config)
        console.log(config);
        for(let key of Object.entries(config)){Reflect.set(process.env, key, config[key])}
        for(let key of Object.entries(site)){Reflect.set(process.env, key, site[key])}
        for(let key of Object.entries(env)){Reflect.set(process.env, key, env[key])}
        // assignAll(process.env, flatten([config, site, flatten(env)]))
    }

    
}
new LoadConfig()
export{LoadConfig}