const defaultLocale = 'en_US';

export const localeMap = {};

var instance = null;

/**
 * resource manager
 */
export class LocaleManager {

    static getInstance() {
        return instance || new LocaleManager();
    }

    constructor() {
        if (instance) {
            return instance;
        }
        instance = this;
    }

    sourcePath = 'locale';

    currentLocale = 'en_US';

    /**
     * initiate the bundle loading for the given locale.
     * 
     * @param {string} bundleName bundle name ie., locale's .properties file name
     * @param {function} callback callback function once the loading is complete
     * @param {string} locale locale name
     */
    load(bundleName, callback=null, locale = 'en_US') {
        if (this.hasBundle(bundleName, locale)) {
            let bundle = this.getBundle(bundleName, locale);
            callback && callback(true, bundle);
            return bundle;
        } else {
            let url = [this.sourcePath, locale, bundleName].join('/') + '.properties?ts=' + Date.now();

            return fetch(url)
                .then(response => response.text())
                .then(textContent => {
                    let map = this.parse(textContent);
                    console.debug(bundleName, locale, map);
                    if (!localeMap.hasOwnProperty(locale)) {
                        localeMap[locale] = {};
                    }
                    localeMap[locale][bundleName] = map;
                    callback && callback(true, map)
                    return map;
                }).catch(error => {
                    callback && callback(false, error);
                    return error;
                });
        }
    }

    setLocale(locale) {
        this.currentLocale = locale;
    }

    /**
     * check wheather the bundle for the given locale is loaded or not. 
     * @param {string} bundleName name of the bundle file
     * @param {string} locale locale name
     * 
     * @return boolean true | false
     */
    hasBundle(bundleName, locale) {
        return localeMap.hasOwnProperty(locale) && localeMap[locale].hasOwnProperty(bundleName);
    }

    /**
     * returns the bundle object for the given locale. if the bundle object not exist will retun and empty object.
     * @param {string} bundleName name of the bundle file
     * @param {string} locale locale name
     * 
     * @returns bundle object for the given locale
     */
    getBundle(bundleName, locale) {
        if (this.hasBundle(bundleName, locale)) {
            return localeMap[locale][bundleName];
        }
        if (this.hasBundle(bundleName, defaultLocale)) {
            return localeMap[defaultLocale][bundleName]; // fallback bundle
        }
        return {}; // do we need to return "null" here?
    }

    /**
     * returns the value of the given key from the specified bundle
     * @param {string} bundleName name of the bundle file name
     * @param {string} key name of the key in the bundle object
     * @param {array} params array of params to substute in the strings
     */
    getString(bundleName, key, params = []) {
        let bundle = this.getBundle(bundleName, this.currentLocale);
        let value = bundle.hasOwnProperty(key) ? bundle[key] : '[--' + key + '--]';
        params && params.forEach((param, index) => {
            value = value.replace(new RegExp('\\{' + index + '\\}', 'g'), param);
        });
        value = value.replace(/{\d+}/g, ''); // removes the unsupplied param index
        return value;
    }

    /**
     * returns an array for the given key from the specified bundle. 
     * @param {string} bundleName name of the bundle
     * @param {string} key name of the key in the bundle
     * @param {array} params array of params to substute in the strings
     */
    getArray(bundleName, key, params = []) {
        let bundle = this.getBundle(bundleName, this.currentLocale);
        let value = bundle.hasOwnProperty(key) ? bundle[key] : '[--' + key + '--]';
        value = value.split(',');
        value.forEach((val, index) => {
            val = val.trim();
            params && params.forEach((param, index) => {
                val = val.replace(new RegExp('\\{' + index + '\\}', 'g'), param);
            });
            val = val.replace(/{\d+}/g, ''); // removes the unsupplied param index
            value[index] = val;
        });
        return value;
    }

    parse(src) {
        var obj = {}

        // convert Buffers before splitting into lines and processing
        src.toString().split('\n').forEach(function (line) {
            // matching "KEY' and 'VAL' in 'KEY=VAL'
            //var keyValueArr = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/)
            var keyValueArr = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
            // matched?
            if (keyValueArr != null) {
                var key = keyValueArr[1]

                // default undefined or missing values to empty string
                var value = keyValueArr[2] || ''

                // expand newlines in quoted values
                var len = value ? value.length : 0
                if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
                    value = value.replace(/\\n/gm, '\n')
                }

                // remove any surrounding quotes and extra spaces
                value = value.replace(/(^['"])/, '').trim(); // remove the first instance of '|"
                len = value.length;
                if (value[len - 2] !== '\\') {
                    value = value.replace(/(['"])$/, '').trim();
                }


                value = value.replace(/(\\")/g, '"').trim();
                value = value.replace(/(\\')/g, "'").trim();



                obj[key] = value
            }
        })

        return obj
    }
}

export default LocaleManager;
