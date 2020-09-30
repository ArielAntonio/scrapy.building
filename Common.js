module.exports = (fsModule, fetchModule, cacheFolder, urlReferer, defaultWaitTime, enableVerbose) => {
    return new Common(fsModule, fetchModule, cacheFolder, urlReferer, defaultWaitTime, enableVerbose);
};

/**
 * Common operations. 
 *
 * Contains some methods to fetch from network, save to cache, read the cache and file and url names transformations.
 */
class Common {
    self; 
    // Default time for waiting operations.
    DEFAULT_WAITING_TIME;
    enableVerbose;
    /**
     * Init the common lib methods. 
     *
     *
     * @param {Object}   fsModule           Filesystem Module, required.
     * @param {Object}   fetchModule        Fetch Node Module, required.
     * @param {string}   [cacheFolder]      Name of the cache folder, optional
     * @param {string}   [urlReferer]       Url to append to requests as referer, optional.
     * @param {int}   [defaultWaitTime]       Default wating time (for delay), optional, default 10.
     * @param {boolean}  [enableVerbose]    Add messages to the console on some operations
     *
     * @return {Object} New instance of Common.
     */
    constructor ( fsModule, fetchModule, cacheFolder, urlReferer, defaultWaitTime , enableVerbose){
        if(fsModule === undefined)
            throw Error("Filesystem module should not be null");
        if(fetchModule === undefined)
            throw Error("Node-fetch module should not be null");
            
        Common._self = this;
        Common._self.urlReferer = urlReferer || "https://www.duckduckgo.com/";
        Common._self.cacheFolder = cacheFolder || "cache";
        Common._self.fs = fsModule;
        Common._self.fetch = fetchModule;
        this.enableVerbose = enableVerbose !== undefined ? enableVerbose : false;
        Common._self.DEFAULT_FETCH_OPTIONS = {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:80.0) Gecko/20100101 Firefox/80.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Upgrade-Insecure-Requests": "1",
                "Cache-Control": "max-age=0"
            },
            "referrer": Common._self.urlReferer,
            "method": "GET",
            "mode": "cors"
        };
        //Public
        this.DEFAULT_WAITING_TIME = defaultWaitTime === undefined ? 10 : defaultWaitTime;
        Common._self.CACHE_TEMPLATE_URL = "#URL";
        Common._self.CACHE_TEMPALTE_STRING = `${Common._self.cacheFolder}/${Common._self.CACHE_TEMPLATE_URL}.cache.html`
    }
    /**
     * Try to get file from the local cache. 
     *
     * Look for the cache folder and then read the content as text, resolves the text or reject with the error.
     *
     *
     * @param {string}   filename           Name of the cache file.
     *
     * @return {string} Text file content.
     */
    readFromCache(filename){
        return new Promise( (resolve, reject) =>{
            try{
                Common._self.fs.readFile(Common._self.getCacheFilename(filename), 'utf8', (err, filedata) => {
                    if (err) reject(err);
                    resolve(filedata);
                });
            }
            catch(err){
                reject(err);
            }
        });
    }
    
    /**
     * Try to get file from the network (internet). 
     *
     * Look for the url page as text, then save it's content to cache folder, resolves the text or reject with the error.
     *
     *
     * @param {string}   url           Url to get like: http://duckduckgo.com.
     *
     * @return {string} Text content of the page.
     */
    readFromNetwork(url){
        return new Promise( (resolve, reject) => {
            // Get
            Common._self.fetch(url, Common._self.DEFAULT_FETCH_OPTIONS)
            // Wait
            .then((response) => {
                if(response.ok)
                    return response.text();
                reject(response.status);
            })
            // Save it
            .then((response) => {
                return Common._self.saveToCache(Common._self.urlToCachename(url), response)
                .then(() => response)
            })
            // Return
            .then((response) => resolve(response));
        });
    }
    
    /**
     * Save content with specified name. 
     *
     * Write a file to the disk on the configured cache folder with the url transformed name.
     *
     *
     * @param {string}   filename           Name of the cache file.
     * @param {string}   fileContent        Content of the file.
     * 
     * @return {string} Text file content.
     */
    saveToCache(filename, fileContent){
        let _self = this;
        return new Promise((resolve, reject) => {
            Common._self.fs.writeFile(Common._self.getCacheFilename(filename), fileContent, function(err){
                if(err) 
                    reject(err);
                if(_self.enableVerbose)
                    console.log(`File successfully written! - Check your project directory for the ${filename}`);
                resolve(fileContent);
            });
        });
    }
    
    /**
     * Get the relative path and the name of the physical file based on input. 
     *
     * Replaces from template variable the name and folder of the cache file.
     *
     *
     * @param {string}   filename           Name of the cache file.
     *
     * @return {string} The relative path and name of file to cache.
     */
    getCacheFilename(filename){
        if(this.enableVerbose)
            console.log("[getCacheFilename] ", Common._self.CACHE_TEMPALTE_STRING.replace(Common._self.CACHE_TEMPLATE_URL, filename) )
        return Common._self.CACHE_TEMPALTE_STRING.replace(Common._self.CACHE_TEMPLATE_URL, filename);
    }
    
    /**
     * Transform the name of the url to a safe cache name and trim URI characters. 
     *
     * With replaces values try to get a safe name to save the downloaded file and save it to the cache.
     *
     *
     * @param {string}   url           Site url.
     *
     * @return {string} Name of the cache file equivalent to the passed url.
     */
    urlToCachename(url){
        let cachename = url.replace(":","").replace("https","").replace("http","")
        .replace("www","").replace(/\/\//g,"").replace("=","_").replace("?","-");
    
        while(cachename.indexOf(".") == 0)
            cachename = cachename.replace(".","");
        
        cachename = cachename.replace(/\?/g,"_");
        cachename = cachename.replace(/\(/g,"_.");
        cachename = cachename.replace(/\)/g,"._");
        cachename = cachename.replace(/\=/g,"__");
        cachename = cachename.replace(/\&/g,"..");
        cachename = cachename.replace(/\[/g,".-");
        cachename = cachename.replace(/\]/g,"-.");
        cachename = cachename.replace(/\#/g,".");
        return cachename.replace(/\//g,"-");
    }

    /**
     * Wait some time then do a job.
     *
     * A promise version of simple timeout based on seconds.
     *
     *
     * @param {int}             secs                  Seconds to wait.
     * @param {Object}          [returnValue]         Posible value to process after ( Promise chains).
     *
     * @return {string} Text file content.
     */
    delay(secs, returnValue){
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(returnValue), secs * 1000);
        });
    }

    /**
     * Try to get some requested Url, cache first, network then. 
     *
     * Look the file on the cache, and if is not found look on the network, then save the result and return it.
     *
     *
     * @param {string}   siteUrl           Url of the site to get.
     *
     * @return {string} Text file content or error.
     */
    getPage(siteUrl){
        let siteCacheName = Common._self.urlToCachename(siteUrl);
        if(this.enableVerbose)
            console.log("Try get ", siteCacheName);
        return Common._self.readFromCache(siteCacheName)
        .catch( (err) => {
            if(this.enableVerbose)
            console.log(err);
            return Common._self.readFromNetwork(siteUrl);
        });
    }

    /**
     * Get a random value on range.
     *
     * Simple Math.random wrapper to get a random between 1 and the provided value.
     *
     *
     * @param {int}   rangeValue           Max possible value.
     *
     * @return {int} The random generated value.
     */
    getRandomTime( rangeValue){
        if(rangeValue === undefined)
            return 0;
        if(rangeValue === 0)
            return 0;
        return Math.floor((Math.random() * rangeValue) +1);
    }

    /**
     * Update the default fetch referer value. 
     *
     * Updates Common._self.DEFAULT_FETCH_OPTIONS.
     *
     *
     * @param {string}   urlReferer           The new url referer.
     *
     */
    setReferer(urlReferer){
        if(urlReferer=== undefined)
            throw new Error("urlReferer should not be undefined");
        Common._self.DEFAULT_FETCH_OPTIONS.referrer = urlReferer;
    }
  }
