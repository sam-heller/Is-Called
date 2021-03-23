const fs = require('fs')
const util = require('util')
const flatten = require('flat')
const toml = require('toml')
const oe = require('./over-engineering')

require('dotenv').config()

class LoadConfig{
    constructor(){
        this.loadGlobals()
        this.loadConfig()      
    }

    loadConfig(){
        let config = oe.addGetAndDelete(toml.parse(fs.readFileSync('wrangler.toml')))
        let site = config.getAndDelete('site')
        let env = config.getAndDelete('env').getAndDelete(process.env.ENVIRONMENT)
        for (let ns of env.getAndDelete('kv_namespaces')){
            if (ns['binding'] == process.env.DATA_NAMESPACE_KEY){process.env.DATA_NAMESPACE_ID = ns['id']}
            if (ns['binding'] == process.env.QUEUE_NAMESPACE_KEY){process.env.QUEUE_NAMESPACE_ID = ns['id']}
            if (ns['binding'] == process.env.CONTENT_NAMESPACE_KEY){process.env.CONTENT_NAMESPACE_ID = ns['id']}
        };
        env['site_name'] = env.getAndDelete('name')
        env['routes'] = env.routes.join(',')
        Object.assignAll(process.env, [config, site, flatten(env)])
    }

    loadGlobals(){
        global.fetch = require('node-fetch')
        global.cflog = function(message, data){
            for (let key of Object.keys(data)){message += ` ${key}='${data[key]}'`}
            console.log(message)
        }        
        global.objlog = function(message, obj){
            console.log(`${message}: ` + util.inspect(obj))
        }
    }
}
new LoadConfig()