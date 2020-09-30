module.exports = (cheerioModule, commonModule) =>  
    new YapoResult(cheerioModule, commonModule); 

class YapoResult {
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
        
        let resultSection = $(".listing_thumbs", "table.listing_thumbs");
        
        resultSection.each((i, item) => {
            console.log(item);
            let qItem = $(item);
            let buildingId = qItem[0].attribs["id"];
            let isFetured = qItem.find(".thumbs_subject").children().eq(1).text().replace("\n","").replace("\t","").trim(); 
            
            let priceType = isFetured.split(" ")[0];
            let priceValue = isFetured.split(" ")[1];
            
            let buildingProjectName = qItem.find(".thumbs_subject").children().eq(0).text().trim();
            let buildingUrl = qItem.find("a").attr("href");

            let detailInfoSection = qItem.find(".icons");

            let listSurface = this.GetSurface(detailInfoSection, $);

            let buildingSurface =  (listSurface.length==2)?listSurface[0]:"";
            let buildingTotalSurface =  (listSurface.length==2)?listSurface[1]:listSurface[0];
            let buildingRooms = this.GetRooms(detailInfoSection,$);
            let buildingBathRooms = this.GetBathrooms(detailInfoSection,$);



            // let photoSection = qItem.find(".clp-search-image-container");
            // //let buildingUrl = photoSection.find("a").attr("href");
            // let buildingUrlRaw = buildingUrl;
            // let buildingProjectPhoto = photoSection.find("img").attr("src");
            // let buildingProjectPhotoDesc = photoSection.find("img").attr("alt");
            // let publicationDate = photoSection.last().text();
            // //console.log(photoSection.html());
            // let infoSectionOne = photoSection.next();
            
            // //console.log(infoSectionOne.html());
            // //let buildingProjectName = infoSectionOne.find(".publication-title-list").first().text().trim();
            
            // let buildingDescription = infoSectionOne.children().eq(1).text();
            // // TODO: Cleanup ID, and get type, check for erros on get
            // //let buildingId = infoSectionOne.children().eq(2).text().trim().split("\n")[0].split(":")[1].trim();
            // //let buildingType = infoSectionOne.find(".item_subtitle").text().trim();
            // //let buildingAddress = buildingProjectName;

            // let infoSection = infoSectionOne.next();
            // let priceTag = "";
            // //let priceType = infoSection.find(".clp-value-container").last().text().trim();
            // //let priceValue = infoSection.find(".clp-value-container").first().text().trim().replace(/\./g,"");
            // // TODO buscar texto de contenido para detectar diferencias en detalle (a veces 2, 3 o 4)
            // let detailInfoSection = infoSection.find("small");
            // let buildingSurface = this.GetSurface(detailInfoSection);
            // //let buildingTotalSurface = this.GetTotalSurface(detailInfoSection);
            // //let buildingRooms = this.GetRooms(detailInfoSection);
            // //let buildingBathRooms = this.GetBathrooms(detailInfoSection);

            // let agencyName = infoSection.find("img").attr("alt") || "No detectada";
            // let agencyLogo = infoSection.find("img").attr("src") || "#";
            
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

    GetDetailSection(sectionElement, ClassToFind, $){
        
        let spanDetail=undefined;
        sectionElement.each((i,items)=>{
            let Yapoitems = $(items);
            let typeClass = Yapoitems.find('i').attr('class');
            if(typeClass == ClassToFind){
                spanDetail = Yapoitems.find('span')
            };
        });
        return spanDetail;
    }

    GetSurface(sectionElement, $)
    {
        let GetAllSurface=[];
        let ClassToFind = "fal fa-expand icons__element-icon";
        let listsection = sectionElement.find('.icons__element');
        let listDetail = this.GetDetailSection(listsection, ClassToFind, $);
        listDetail.each((i,items)=>{
            let Yapoitems = $(items);
            if(Yapoitems.text()!='/')
                GetAllSurface.push(Yapoitems.text());
        });
        return GetAllSurface;
    }

    GetRooms(sectionElement, $)
    {
        let GetRooms='';
        let ClassToFind = "fal fa-bed icons__element-icon";
        let listsection = sectionElement.find('.icons__element');
        let listDetail = this.GetDetailSection(listsection, ClassToFind, $);
        listDetail.each((i,items)=>{
            let Yapoitems = $(items);
            GetRooms = Yapoitems.text();
        });
        GetRooms= GetRooms.replace(' ',"")
        return GetRooms.replace('\n',"");
    }

    GetBathrooms(sectionElement, $)
    {
        let TextBathrooms="";
        let ClassToFind = "fal fa-bath icons__element-icon";
        let listsection = sectionElement.find('.icons__element');
        let listDetail = this.GetDetailSection(listsection, ClassToFind, $);
        listDetail.each((i,items)=>{
            let Yapoitems = $(items);
            TextBathrooms= Yapoitems.text();
        });
        TextBathrooms = TextBathrooms.replace(' ',"");
        TextBathrooms = TextBathrooms.replace(/\n/g,"");
        return TextBathrooms;
    }

}