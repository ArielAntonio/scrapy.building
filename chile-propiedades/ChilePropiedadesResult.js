
module.exports = (cheerioModule, commonModule) =>  
    new ChilePropiedadesResult(cheerioModule, commonModule); 

class ChilePropiedadesResult {
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
        
        let resultSection = $("div.publication-element ", ".clp-publication-list");
        
        resultSection.each((i, item) => {
            //console.log(item);
            let qItem = $(item);
            let isFetured = qItem.find(".premium-table-item") !== undefined;

            let photoSection = qItem.find(".clp-search-image-container");
            let buildingUrl = photoSection.find("a").attr("href");
            let buildingUrlRaw = buildingUrl;
            let buildingProjectPhoto = photoSection.find("img").attr("src");
            let buildingProjectPhotoDesc = photoSection.find("img").attr("alt");
            let publicationDate = photoSection.last().text();
            //console.log(photoSection.html());
            let infoSectionOne = photoSection.next();
            
            //console.log(infoSectionOne.html());
            let buildingProjectName = infoSectionOne.find(".publication-title-list").first().text().trim();
            let buildingDescription = infoSectionOne.children().eq(1).text();
            // TODO: Cleanup ID, and get type, check for erros on get
            let buildingId = infoSectionOne.children().eq(2).text().trim().split("\n")[0].split(":")[1].trim();
            let buildingType = infoSectionOne.find(".item_subtitle").text().trim();
            let buildingAddress = buildingProjectName;

            let infoSection = infoSectionOne.next();
            let priceTag = "";
            let priceType = infoSection.find(".clp-value-container").last().text().trim();
            let priceValue = infoSection.find(".clp-value-container").first().text().trim();
            // TODO buscar texto de contenido para detectar diferencias en detalle (a veces 2, 3 o 4)
            let buildingSurface = infoSection.find("small").eq(0).text() + " " + infoSection.find("small").eq(1).text();
            let buildingRooms = infoSection.find("small").eq(2).text();
            let buildingBathRooms = infoSection.find("small").eq(3).text();

            let agencyName = infoSection.find("img").attr("alt") || "No detectada";
            let agencyLogo = infoSection.find("img").attr("src") || "#";
            
            let buildingProjectType = "";
            
    
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
            nextLink = $(".btn-primary.btn.btn-raised",".clp-pagination")
            .next().attr("href");
        }catch{ 
            console.log("Unable to find next link");
        }
        
        console.log("The next one is: ", nextLink )
        return nextLink;
    }
}