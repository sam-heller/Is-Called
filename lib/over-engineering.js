/**
 * Mostly pointless and somewhat reckless over-engineering for funskis.
 * Probably a terrible idea. 
 * 
 * Two viewpoints from SO : http://bit.ly/315ttP8
 * ~~ Pro ~~
 *  I think it's fine if it works in your target environment.
 *  
 *  Also I think prototype extension paranoia is overblown. As long as you use hasOwnProperty() 
 *  like a good developer that it's all fine. Worst case, you overload that property elsewhere 
 *  and lose the method. But that's your own fault if you do that.
 * 
 * ~~ Con ~~
 * I'd say this is almost as evil as before. The biggest problem, still the same as before, 
 * is that Object.prototype is global. While your method might currently be solving world 
 * peace, it might have overwriten someone else's method (that was guaranteeing galactic peace) 
 * or may be overwritten in the future by some library you have no control over 
 * (therefore plunging the world into chaos again)
 * 
 */
const pluralize = require('pluralize')

const oe = {
    /**
     * Add method to retrieve and delete an item from an 
     * array accessible object
     * @param {Object} item 
     * @returns 
     */
    addGetAndDelete(item){
        Object.defineProperty(item, 'getAndDelete', {
            value: function(key){
                let value = this[key];
                delete(this[key]);
                return typeof value === 'object' ? oe.addGetAndDelete(value) : value
            },
            writable: true,
            configurable: true,
            enumberable: false
        })
        return item

    },
    /**
     * Add my methods directly (riiiiisky)
     * @param {Object} type 
     * @param {String} property 
     * @param {Function} func 
     */
    badIdeaBear(type, property, func){
        Array.prototype.random = function(){return this[Math.floor(Math.random() * this.length)];}
        Array.prototype.getAndDelete = function(key){let val = this[key]; delete(this[key]); return val;}
        String.prototype.capitalize = function(){let r=[];for(let p of this.split(' ')){r.push(p.charAt(0).toUpperCase()+p.slice(1))}return r.join(" ");}
        String.prototype.pluralize = function(){return pluralize(this)}

        Object.defineProperty(Object, 'assignAll', {
            value: function(t,a){for(let o of a){source = Object.assign(t,o);}return t;},
            writable: true,
            configurable: true,
            enumberable: false
        })        
    }
 }

oe.badIdeaBear()
module.exports = oe