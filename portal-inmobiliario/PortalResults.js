
module.exports = (cheerioModule, commonModule) => {return new PortalResults(cheerioModule, commonModule);}; 

class PortalResults {
    constructor(cheerioModule, commonModule){
        if(cheerioModule === undefined)
            throw error("cheerioModule should not be null");
        this.cheerio = cheerioModule;

        if(commonModule === undefined)
            throw error("commonModule should not be null");
        this.common = commonModule;

        this.buildingList = [];
    }

    ReadEntry(siteText){
        //console.log(siteText);
        let $ = this.cheerio.load(siteText);
        
        let resultSection = $("li.results-item", "#results-section");
        
        resultSection.each((i, item) => {
            //console.log(item);
            let buildingId = $(item).find(".rowItem").attr("id");
    
            let photoSection = $(item).find(".item__image");
            let buildingProjectType = photoSection.find(".item__image-label").text()
            let buildingProjectPhoto = photoSection.find("img").attr("src");
            let buildingProjectPhotoDesc = photoSection.find("img").attr("alt");
            
            let infoSection = $(item).find(".item__info-container");
            let priceTag = infoSection.find(".price__since").text().trim();
            let priceType = infoSection.find(".price__symbol").text();
            let priceValue = infoSection.find(".price__fraction").text();
            let buildingSurface = infoSection.find(".stack_column_item").find(".item__attrs").text();
            let buildingType = infoSection.find(".item_subtitle").text().trim();
            let buildingInfo = infoSection.find(".item__info-title-link").find("span.main-title.nowrap");
            let buildingUrlRaw = infoSection.find(".item__info-title-link").attr("href");
            let buildingUrl = buildingUrlRaw.split("#")[0];
            let buildingAddress = buildingInfo.first().text().trim();
            let buildingProjectName = buildingInfo.last().text();
            let agencyName = infoSection.find(".real-estate-agency-name").text() || "No detectada";
            let agencyLogo = infoSection.find(".real-estate-agency-logo").attr("src") || "#";
            
            let parts = this.ExplodeSurface(buildingSurface);
            let buildingRooms = parts.buildingRooms;
            let buildingBathRooms = parts.buildingBathRooms;
            buildingSurface = parts.buildingSurface;
            
    
            let building = {
                buildingId : buildingId,
                buildingProjectType : buildingProjectType,
                buildingProjectPhoto : buildingProjectPhoto,
                buildingProjectPhotoDesc : buildingProjectPhotoDesc,
                priceTag : priceTag,
                priceType : priceType,
                priceValue : priceValue,
                buildingSurface : buildingSurface,
                buildingRooms : buildingRooms,
                buildingBathRooms : buildingBathRooms,
                buildingType : buildingType,
                buildingAddress : buildingAddress,
                buildingProjectName : buildingProjectName,
                agencyName : agencyName,
                agencyLogo : agencyLogo,
                buildingUrlRaw : buildingUrlRaw,
                buildingUrl : buildingUrl,
                buildingDetail : {}
            };
    
            this.buildingList.push(building);
    
            //console.log(building);
        });
        let nextLink = undefined;
        try{
            nextLink = $(".andes-pagination__button--current")
            .next().find(".andes-pagination__link")
            .first().attr("href");
        }catch{ 
            console.log("Unable to find next link");
        }
        
        console.log("The next one is: ", nextLink )
        return nextLink;
    }

    ExplodeSurface(buildingSurface){
        let subParts = {};
        subParts.buildingSurface = buildingSurface;
        if(buildingSurface.indexOf("|") !== -1)
        {
            let pieces = buildingSurface.split("|");
            if(pieces[0] !== undefined)
                subParts.buildingSurface = pieces[0].trim();
            if(pieces[1] !== undefined)
                subParts.buildingRooms = pieces[1].trim();
            if(pieces[2] !== undefined)
                subParts.buildingBathRooms = pieces[2].trim();
        }
        return subParts;
    }

}
