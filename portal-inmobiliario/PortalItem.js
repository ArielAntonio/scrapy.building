module.exports = (cheerioModule, commonModule) =>  new PortalItem(cheerioModule, commonModule);

class PortalItem{
    constructor(cheerioModule, commonModule){
        this.common = commonModule;
        this.cheerio = cheerioModule;
    }
    
    ReadEntry(siteText){
        let $ = this.cheerio.load(siteText);
        // Found interesting photo links /noindex/images/MLC535331081?noIndex=true
        let itemDescription = $(".item-description__content ").text().trim();
        let itemId = $('[name="itemId"]').val()
        //console.log(itemDescription);
        let scriptsChunks = $('[type="text/javascript"]');
        let itemGeolocation = undefined;
        scriptsChunks.each( (i, item) => {
            if(!item)
                return;
            if(item.children === undefined)
                return;
            if(item.children[0] === undefined)
                return;

            //console.log(item.children[0].data);
            let chunkData = item.children[0].data;
            let GeoData = this.ExtractGeoLocation(chunkData);
            if(GeoData){
                itemGeolocation = GeoData;
                //console.log("GEO: ", GeoData);
            }
        });
        /** UNUSABLE NOT IN HTML */
        let itemModels = $("li.ch-carousel-item");
        //console.log(itemModels.text());
        itemModels.each( (i, model) => {
            model.find(".model-details-wrapper");
            console.log("Surface: ", model.eq(0).text());
            console.log("Rooms: ", model.eq(1).text());
            console.log("Bathrooms: ", model.eq(2).text());
        });


        let itemSpecs = $(".specs-container").find("li.specs-item");
        // console.log(itemSpecs.eq(0).text())

        let item = {
            itemId : itemId,
            itemDescription : itemDescription,
            itemGeolocation : itemGeolocation
        }
        return item;
    }

    ExtractGeoLocation(chunkData){
        let dynIndex = chunkData.indexOf("dynamicMapProperties");
        let longitude = 0;
        let latitude = 0;
        if(dynIndex === -1 )
            return undefined;
        if(dynIndex !== -1 ){
            let subItem = chunkData.substr(chunkData.indexOf("{", dynIndex),
                chunkData.indexOf("}", dynIndex) - chunkData.indexOf("{", dynIndex) +1 );
            longitude= subItem.indexOf("longitude") != -1 
                ?  subItem.substr(subItem.indexOf("longitude") ,
                    subItem.indexOf(",", subItem.indexOf("longitude")) - subItem.indexOf("longitude")) 
                : 0;
            latitude = subItem.indexOf("latitude") != -1 
                ?  subItem.substr(subItem.indexOf("latitude"),
                    subItem.indexOf(",", subItem.indexOf("latitude")) - subItem.indexOf("latitude")) 
                : 0;
            if(latitude !== undefined && latitude.indexOf(":") !== -1)
                latitude = latitude.split(":")[1].trim();
            if(longitude !== undefined && longitude.indexOf(":" !== -1))
                longitude = longitude.split(":")[1].trim()
        }

        return {
            latitude : latitude,
            longitude : longitude
        };
    }

    
}