
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
            let isFeatured = qItem.find(".premium-table-item") !== undefined;

            let photoSection = qItem.find(".clp-search-image-container");
            let buildingUrl = photoSection.find("a").attr("href");
            let buildingUrlRaw = buildingUrl;
            let buildingProjectPhoto = photoSection.find("img").attr("src");
            let buildingProjectPhotoDesc = photoSection.find("img").attr("alt");
            let publicationDate = photoSection.last().text();
            //console.log(photoSection.html());
            let infoSectionOne = photoSection.next();
            
            //console.log(infoSectionOne.html());
            let ProjectTitleData = infoSectionOne.find(".publication-title-list").first().text().trim();
            let buildingProjectName = this.GetProjectName(ProjectTitleData);
            let buildingDescription = infoSectionOne.children().eq(1).text();
            // TODO: Cleanup ID, and get type, check for erros on get
            let buildingId = infoSectionOne.children().eq(2).text().trim().split("\n")[0].split(":")[1].trim();
            let buildingType = buildingProjectPhotoDesc.split("/")[1].trim()
            let buildingAddress = this.GetProjectAddress(ProjectTitleData);

            let infoSection = infoSectionOne.next();
            let priceTag = "";
            let priceType = infoSection.find(".clp-value-container").last().text().trim();
            let priceValue = infoSection.find(".clp-value-container").first().text().trim().replace(/\./g,"");
            // TODO buscar texto de contenido para detectar diferencias en detalle (a veces 2, 3 o 4)
            let detailInfoSection = infoSection.find("small");
            let buildingSurface = this.GetSurface(detailInfoSection);
            let buildingTotalSurface = this.GetTotalSurface(detailInfoSection);
            let buildingRooms = this.GetRooms(detailInfoSection);
            let buildingBathRooms = this.GetBathrooms(detailInfoSection);

            let agencyName = infoSection.find("img").attr("alt") || "No detectada";
            let agencyLogo = infoSection.find("img").attr("src") || "#";
            
            let buildingProjectType = buildingProjectPhotoDesc.split("/")[0].trim();
            
    
            let building = {
                buildingId : buildingId,
                buildingProjectType : buildingProjectType,
                buildingProjectPhoto : buildingProjectPhoto,
                buildingProjectPhotoDesc : buildingProjectPhotoDesc,
                priceTag : priceTag,
                priceType : priceType,
                priceValue : priceValue,
                buildingSurface : buildingSurface,
                buildingTotalSurface : buildingTotalSurface,
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

    GetProjectName( sectionText ){
        
        let splitedNewLine = sectionText.split("\n");
        let splitedProjectName = splitedNewLine[0].split(",");
        return splitedProjectName[1].trim();
    }

    GetProjectAddress(sectionText){
        let splitedNewLine = sectionText.split("\n");
        let splitedProjectName = splitedNewLine[0].split(",");
        return splitedProjectName[0].trim();
    }

    GetDetailSection(sectionElement, textToFind){
        let sectionValue = "";
        let item = {};
        for(let i = 0; item !== undefined ;i++){
            item = sectionElement.eq(i);
            //console.log(item.text());
            if( item.length === 0){
                item = undefined;
                break;
            }
            if(item.text().indexOf(textToFind) === -1){
                continue;
            }
            sectionValue = item.text().split(":")[1].trim();
        }
        return sectionValue;
    }

    GetTotalSurface( sections ){
        
        let textToFind = "Terreno";
        let surface = this.GetDetailSection(sections, textToFind);
        return surface;
    }

    GetSurface( sections ){
        
        let textToFind = "Superficie Construida";
        let surface = this.GetDetailSection(sections, textToFind);
        return surface;
    }

    GetRooms(sections){
        let textToFind = "Habitaciones";
        let rooms = this.GetDetailSection(sections, textToFind);
        return rooms;
    }

    GetBathrooms(sections){
        let textToFind = "Baños:";
        let rooms = this.GetDetailSection(sections, textToFind);
        return rooms;
    }
}