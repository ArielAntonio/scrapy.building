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
        
        let itemModelsRaw = $("li", ".scroll-carousel");//.find("li");
        let itemModels = this.ReadModelData(itemModelsRaw);
        
        //console.log(itemModels);


        let itemSpecs = $(".specs-container").find("li.specs-item");
        //console.log(itemSpecs.eq(0).text())
        let itemPhotosData = $(".gallery-content").attr("data-full-images");
        let itemPhotoList = this.ExtractPhotoData(itemPhotosData);
        //console.log(itemPhotosData);
        let item = {
            itemId : itemId,
            itemDescription : itemDescription,
            itemGeolocation : itemGeolocation,
            itemPhotoList : itemPhotoList,
            itemModelList : itemModels
        }
        return item;
    }

    ExtractItemData(itemSpecs){

    }

    ReadModelData(itemModelsRaw){
        if(itemModelsRaw === undefined)
            return [];
        let itemModels = [];

        itemModelsRaw.each( (i, model) => {
            
            let ModelItem = $(model);
            
            let modelId = ModelItem.find("img").first().attr("title");
            let modelPhoto =  ModelItem.find("img").first().attr("src");
            let ModelData = ModelItem.find("dd");
            let surface = ModelData.eq(0) !== undefined ? ModelData.eq(0).text() : undefined;
            let rooms = ModelData.eq(1) !== undefined ? ModelData.eq(1).text() : undefined;
            let bathrooms = ModelData.eq(2) !== undefined ? ModelData.eq(2).text() : undefined;
            let itemModel = {
                modelId : modelId,
                modelPhoto : modelPhoto,
                modelSurface : surface,
                modelRooms : rooms,
                modelBathrooms : bathrooms
            };
            itemModels.push(itemModel);
        });
        return itemModels;
    }

    ExtractPhotoData(itemPhotosData){
        if( itemPhotosData === undefined)
            return [];
        // Clean &quote elements
        let itemPhotoDataClean = itemPhotosData.replace(/\&quote;/g,"\"");
        if(itemPhotoDataClean === undefined)
            return [];
        let itemPhotoList = [];
        JSON.parse(itemPhotoDataClean).forEach((imageData) => {
            // imageData contains {src : "", h : "", w : ""}
            itemPhotoList.push(imageData.src);
        });
        return itemPhotoList;
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