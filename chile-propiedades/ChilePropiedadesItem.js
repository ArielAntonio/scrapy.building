module.exports = (cheerioModule, commonModule) =>  new ChilePropiedadesItem(cheerioModule, commonModule);

class ChilePropiedadesItem{
    constructor(cheerioModule, commonModule){
        this.common = commonModule;
        this.cheerio = cheerioModule;
    }

    ReadEntry(siteText){
        let $ = this.cheerio.load(siteText);

        let itemSection = $("div.md-card.md-card-with-padding");
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
        let itemPhotosData = $("ul.image-view-publication-clp");
        let itemPhotoList = this.ExtractPhotoData($, itemPhotosData);
        console.log("Photos :", itemPhotoList);
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
        console.log(item);
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

    ExtractPhotoData($, itemPhotosData){
        if( itemPhotosData === undefined)
            return [];
        let itemPhotoList = [];

        itemPhotosData.find("li").each( (i, item) =>
        {
            let _imageElement = $(item).find("img");
            if(_imageElement === undefined)
                return;
            let _src = _imageElement.attr("src");
            if(_src === undefined)
                return;
            itemPhotoList.push(_src);
        });

        return itemPhotoList;
    }

    ExtractGeoLocation(chunkData){
        let dynIndex = chunkData.indexOf("locationP");
        /*
            var locationP = [

                -33.5166667,-70.7666667
            ];
        */

        let longitude = 0;
        let latitude = 0;
        if(dynIndex === -1 )
            return undefined;
        if(dynIndex !== -1 ){
            let subItem = chunkData.substr(chunkData.indexOf("[", dynIndex),
                chunkData.indexOf("]", dynIndex) - chunkData.indexOf("[", dynIndex)+1);

            latitude = subItem.indexOf(",") != -1
                ?  subItem.substr(1 ,
                    subItem.indexOf(",")).trim()
                : 0;
            longitude = subItem.indexOf(",") != -1
                ?  subItem.substr(subItem.indexOf(",") + 1,
                    subItem.length - subItem.indexOf(",") - 2).trim()
                : 0;

        }

        return {
            latitude : latitude,
            longitude : longitude
        };
    }


}
