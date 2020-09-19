module.exports = (fsModule, fetchModule, cacheFolder, urlReferer) => {
    return new Common(fsModule, fetchModule, cacheFolder, urlReferer);
};

/**
 * Common operations. 
 *
 * Contains some methods to fetch from network, save to cache, read the cache and file and url names transformations.
 */
class Common {
    self; 

    /**
     * Init the common lib methods. 
     *
     *
     * @param {Object}   fsModule           Filesystem Module, required.
     * @param {Object}   fetchModule        Fetch Node Module, required.
     * @param {string}   [cacheFolder]      Name of the cache folder, optional
     * @param {string}   [urlReferer]       Url to append to requests as referer, optional.
     *
     * @return {Object} New instance of Common.
     */
    constructor ( fsModule, fetchModule, cacheFolder, urlReferer ){
        if(fsModule === undefined)
            throw Error("Filesystem module should not be null");
        if(fetchModule === undefined)
            throw Error("Node-fetch module should not be null");
            
        Common._self = this;
        Common._self.urlReferer = urlReferer || "https://www.duckduckgo.com/";
        Common._self.cacheFolder = cacheFolder || "cache";
        Common._self.fs = fsModule;
        Common._self.fetch = fetchModule;
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
            Common._self.fs.readFile(Common._self.getCacheFilename(filename), 'utf8', (err, filedata) => {
                if (err) reject(err);
                
                resolve(filedata);
            });
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
        return new Promise((resolve, reject) => {
            Common._self.fs.writeFile(Common._self.getCacheFilename(filename), fileContent, function(err){
                if(err) 
                    reject(err);
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
        .replace("www","").replace(/\/\//g,"");
    
        while(cachename.indexOf(".") == 0)
            cachename = cachename.replace(".","");
        
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
        console.log("Try get ", siteCacheName);
        return Common._self.readFromCache(siteCacheName)
        .catch( (err) => {
            console.log(err);
            return Common._self.readFromNetwork(siteUrl);
        });
    }
  }
