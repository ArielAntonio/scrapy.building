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
        let itemPublicationNumber = $(".item-info__id-number").text()
        let itemReportLink = $(".item-info__denounce").children().first().attr("href");
        //console.log(itemDescription);
        let scriptsChunks = $('[type="text/javascript"]');
        let itemGeolocation = undefined;
        let itemAddress = $(".map-address").text();
        let itemAddressLocation = $(".map-location").text()
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
        let itemModels = this.ReadModelData($, itemModelsRaw);
        
        //console.log(itemModels);


        let itemSpecs = this.ExtractItemData($(".specs-container").find("li.specs-item"));
        //console.log(itemSpecs)
        let itemPhotosData = $(".gallery-content").attr("data-full-images");
        let itemPhotoList = this.ExtractPhotoData(itemPhotosData);
        let itemPublicationCode = $(".info",".info-property-code").text();
        let itemPublicationDate = $(".info",".info-property-date").text();
        let itemContractorData = {
            contractorName : $("#real_estate_agency",".official-store-container").text(),
            contractorLogo : $(".brand-container",".official-store-container").attr("style")
        }
        if(itemContractorData.contractorLogo !== undefined )
            itemContractorData.contractorLogo = itemContractorData.contractorLogo.slice( 
                itemContractorData.contractorLogo.indexOf("(") +1,
                itemContractorData.contractorLogo.indexOf(")")
            )
        //console.log(itemPhotosData);
        let item = {
            itemId : itemId,
            itemDescription : itemDescription,
            itemGeolocation : itemGeolocation,
            itemAddress : itemAddress,
            itemAddressLocation : itemAddressLocation,
            itemSurfaceRange : itemSpecs.itemSurfaceRange,
            itemRoomsRange : itemSpecs.itemRoomsRange,
            itemBathroomsRange : itemSpecs.itemBathroomsRange,
            itemStatus : itemSpecs.itemStatus,
            itemCompletionDate : itemSpecs.itemCompletionDate,
            itemPublicationCode : itemPublicationCode,
            itemPublicationDate : itemPublicationDate,
            itemContractorData : itemContractorData,
            itemPhotoList : itemPhotoList,
            itemModelList : itemModels,
            itemPublicationNumber : itemPublicationNumber,
            itemReportLink : itemReportLink
        }
        return item;
    }

    ExtractItemData(itemSpecs){
        if(itemSpecs === undefined)
            return undefined;
        let specs = {};

        specs.itemSurfaceRange = this.GetElementText(itemSpecs, 0, "span");
        specs.itemRoomsRange = this.GetElementText(itemSpecs, 1, "span");
        specs.itemBathroomsRange = this.GetElementText(itemSpecs, 2, "span");
        specs.itemStatus = this.GetElementText(itemSpecs, 3, "span");
        specs.itemCompletionDate = this.GetElementText(itemSpecs, 4, "span");

        return specs;
    }

    GetElementText(element, index, findSelector){
        if(element === undefined)
            return;
        if(index === undefined)
            return;
        
        let readValue = element.eq(index);
        if(readValue === undefined)
            return;
        readValue = findSelector === undefined ? readValue : readValue.find(findSelector) ;
        if(readValue === undefined)
            return;
        readValue = readValue.text();
        if(readValue === undefined)
            return;
        return readValue = readValue.trim();
    }

    ReadModelData($, itemModelsRaw){
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