function loadRecommendations(){
    $.getJSON("/getposts", function(postList){

        var username = "JCJordan";
        var filteredPostList = getStatsByUser(postList, username);

    });
}

function loadStats(){
    $.getJSON("/getPosts", function(postList){

        var statList = {
            topFoodType: "", bottomFoodType: "",
            topMealType: "", bottomMealType: "",
            topFoodTypeByArea: "", bottomFoodTypeByArea: "",
            topMealTypeByArea: "", bottomMealTypeByArea: "",
            percentageCollected: 0,
            usageByLocation: ""
        };

        var foodTypeData = getFoodTypeData(postList);
        statList.topFoodType = foodTypeData.top;
        statList.bottomFoodType = foodTypeData.bottom;
        var mealTypeData = getMealTypeData(postList);
        statList.topFoodType = mealTypeData.top;
        statList.bottomFoodType = mealTypeData.bottom;
        var foodTypeDataByArea = foodTypeData.areaData;
        statList.topFoodTypeByArea = foodTypeDataByArea.top;
        statList.bottomFoodTypeByArea = foodTypeDataByArea.bottom;
        var mealTypeDataByArea = mealTypeData.areaData;
        statList.topFoodTypeByArea = mealTypeDataByArea.top;
        statList.bottomFoodTypeByArea = mealTypeDataByArea.bottom;
        statList.percentageCollected = getPercentageCollected(postList);
        statList.usageByLocation = getUsageByLocation(postList);

        for(var key in statList){
            $('#statList').append(
                $('<li>').append(key + ": " + statList[key])
            );
        }

    });
}

function getFoodTypeData(postList){
    var foodTypes = {dairy: 0, fruits: 0, grains: 0, meat: 0, sweets: 0, vegetables: 0, drink: 0};
    return {top: "", bottom: "", areaData: {top: "", bottom: ""}};
}

function getMealTypeData(postList){
    var mealTypes = {breakfast: 0, lunch: 0, dinner: 0, snack: 0};
    var mealTypeData = {top: "", bottom: "", areaData: {top: "", bottom: ""}};
    for(var i = 0; i < postList.length; i++){
        var post = postList[i];
        if(post.mealtype !== null){
            switch(post.mealtype){
                case "breakfast":
                    mealTypes.breakfast += 1;
                    break;
                case "lunch":
                    mealTypes.lunch += 1;
                    break;
                case "dinner":
                    mealTypes.dinner += 1;
                    break;
                case "snack":
                    mealTypes.snack += 1;
                    break;
            }
        }
    }

    return mealTypeData;

    mealTypeData.top = Math.max(mealTypes.breakfast, mealTypes.lunch, mealTypes.dinner, mealTypes.snack);
    mealTypeData.bottom = Math.min(mealTypes.breakfast, mealTypes.lunch, mealTypes.dinner, mealTypes.snack);
}

function getPercentageCollected(postList){
    return 0;
}

function getUsageByLocation(postList){
    return {London: 0, Canada: 0};
}

function getStatsByUser(postList, username){
    var filteredPostList = [];
    for(var i = 0; i < postList.length; i++){
        if(postList[i].username === username){
            filteredPostList.push(postList[i].title);
        }
    }
    return filteredPostList;
}