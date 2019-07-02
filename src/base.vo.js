/**
 * BaseVo base class for all the vo class.
 */
export class BaseVo {

    _label;

    /**
     * getter for label property
     */
    get label() {
        return this._label;
    }

    /**
     * setter for label
     */
    set label(value) {
        this._label = value;
    }

    /**
     * constructor
     * @param {object} mixin 
     */
    constructor(mixin) {

        if (mixin) {
            this.build(mixin)
        }
    }

    /**
     * construct the object with the properties of mixin properties
     * @param {object} mixin 
     * @returns {object} this object
     */
    build(mixin) {

        for (var key in mixin) {
            this.onKeyValue(key, mixin[key]);
        }

        return this;
    }

    /**
     * helper method to process the key and value while the build is execuited
     * @param {string} key 
     * @param {any} value 
     * 
     * @see #build
     */
    onKeyValue(key, value) {
        /*
        if (!this.hasOwnProperty(key)) {
             console.warn('Found New KEY: "' + key + '" in ', this.constructor.name + ' With following Value: ', value);
        }
        */
        //if (this.hasOwnProperty(key)) {
        this[key] = value;
        /*}
        else {
            console.warn('Found New KEY: "' + key + '"', this);
        }*/

    }

    /**
     * get the value of prop 'key' in the  given valueObject and send it back as array
     * 
     * @param {object} valueObject 
     * @param {string} key 
     * 
     * @returns {array} array 
     */
    toArray(valueObject, key) {
        if (!valueObject) {
            return [];
        }

        if (typeof valueObject === 'string') {
            return [];
        }
        else if (valueObject.hasOwnProperty(key)) {
            var arr = valueObject[key];
            if (arr instanceof Array) {
                return arr;
            }
            else {
                return [arr];
            }
        }
        else {
            return [];
        }
    }

    /**
     * conver all the entities of the array of type of TYPE class
     * 
     * @param {array} array 
     * @param {class} TYPE 
     * 
     * @returns {array} same array with type converted vo
     */
    toTypedArray(array, TYPE, ...params) {

        if ('build' in new TYPE()) {//if (new TYPE().hasOwnProperty('build')) {
            var l = array.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                arr.push(new TYPE(...params).build(array[i]));
            }
            return arr;
        }
        else {
            return array;
        }
    }
}