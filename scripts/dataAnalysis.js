function loadRecommendations(username){
    $.getJSON("/getPosts", function(postList){
        $.getJSON("/getArchiveData", function(archiveData) {

            var filteredPostList = getStatsByUser(postList, username);
            var statList = calcUserStats(filteredPostList, archiveData);

            var recommendations = {foodTypes: [], mealTypes: []};
            var topFoodType = {hr: "", value: -1};
            var topMealType = {hr: "", value: -1};

            for(var key in statList.foodTypeData.value){
                var foodType = statList.foodTypeData.value[key];
                if(foodType.value >= 3){
                    recommendations.foodTypes.push("You've made " + foodType.value + " posts of type \"" + foodType.hr + "\" that have gone uncollected, " +
                        "you should most likely buy less of this category of food.");
                }
                if(foodType.value >= topFoodType.value){
                    topFoodType = foodType;
                }
            }
            for(var key in statList.mealTypeData.value){
                var mealType = statList.mealTypeData.value[key];
                if(mealType.value >= 3){
                    recommendations.mealTypes.push("You've made " + mealType.value + " posts of type \"" + mealType.hr + "\" that have gone uncollected, " +
                        "you should most likely buy less food for this type of meal");
                }
                if(mealType.value >= topMealType.value){
                    topMealType = mealType;
                }
            }

            var prediction = "more likely to give away food with types: \"" + topFoodType.hr + "\" and/or \"" + topMealType.hr + "\".";

            $.ajax({
                type: "POST",
                url: "/addPrediction",
                data: {user: username, prediction: prediction}
            });

            for(var i in recommendations.foodTypes){
                addToNotificationList(recommendations.foodTypes[i]);
            }
            for(var i in recommendations.mealTypes){
                addToNotificationList(recommendations.mealTypes[i]);
            }

            // Reduce category if:
            // - Considerably more than other categories, potentially by percentage amount.
            // - Sustained type of product given away over a period of time e.g. keeps giving dairy away for months.
            // - Check area for desired products

            // Predictions:
            // - If they give away a product a lot, they'll give it away next more likely.
            // - Maybe check for seasonal changes.

        });
    });
}

function addToNotificationList(notificationText){
    // CREATE LIST
    var notifList = $('<li>');
    notifList.addClass('notification')

    // CREATE DIV FOR LIST
    var notifDiv = $('<div>');
    notifDiv.addClass('panel panel-default');
    notifDiv.appendTo(notifList);

    // CREATE PANEL HEADER
    var headerDiv = $('<div>');
    headerDiv.addClass('panel-heading');
    headerDiv.text("User Recommendation!");
    headerDiv.appendTo(notifDiv);

    // CREATE PANEL BODY
    var bodyDiv = $('<div>');
    bodyDiv.addClass('panel-body');
    var spanBody = $('<span>'); // NOT WORKING
    spanBody.addClass('glyphicon glyphicon-cutlery');
    spanBody.appendTo(bodyDiv);
    bodyDiv.text(notificationText);

    // FINALISE
    bodyDiv.appendTo(notifDiv);

    $("#notificationList").append(notifList);
}

function loadStats(){
    $.getJSON("/getPosts", function(postList){
        $.getJSON("/getArchiveData", function(archiveData){

            var statList = calcFullStats(postList, archiveData);

            for(var key in statList){

                var table = document.getElementById("statList");

                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerHTML = statList[key].hr;
                if(typeof(statList[key].value) === "object"){
                    var ul = $('<ul>').css("list-style","none").css("padding-left", 0).appendTo(cell2);
                    for(var statKey in statList[key].value) {
                        ul.append(
                            $(document.createElement('li')).text(statKey + ": " + statList[key].value[statKey])
                        );
                    }
                } else {
                    cell2.innerHTML = statList[key].value;
                }


            }
        });
    });
}

function calcFullStats(postList, archiveData){

    var statList = {
        topFoodType: {hr: "Top Food Type", value: ""}, bottomFoodType: {hr: "Bottom Food Type", value: ""},
        topMealType: {hr: "Top Meal Type", value: ""}, bottomMealType: {hr: "Bottom Meal Type", value: ""},
        topFoodTypeByArea: {hr: "Top Food Type By Area", value: ""}, bottomFoodTypeByArea: {hr: "Bottom Food Type By Area", value: ""},
        topMealTypeByArea: {hr: "Top Meal Type By Area", value: ""}, bottomMealTypeByArea: {hr: "Bottom Meal Type By Area", value: ""},
        percentageCollected: {hr: "Percentage Collected", value: 0},
        usageByLocation: {hr: "Usage By Location", value: ""}
    };

    var foodTypeData = getFoodTypeData(postList);
    statList.topFoodType.value = foodTypeData.top;
    statList.bottomFoodType.value = foodTypeData.bottom;
    var mealTypeData = getMealTypeData(postList);
    statList.topMealType.value = mealTypeData.top;
    statList.bottomMealType.value = mealTypeData.bottom;
    var foodTypeDataByArea = {top: {}, bottom: {}};
    for(var key in foodTypeData.areaData){
        foodTypeDataByArea.top[key] = foodTypeData.areaData[key].top;
        foodTypeDataByArea.bottom[key] = foodTypeData.areaData[key].bottom;
    }
    statList.topFoodTypeByArea.value = foodTypeDataByArea.top;
    statList.bottomFoodTypeByArea.value = foodTypeDataByArea.bottom;
    var mealTypeDataByArea = {top: {}, bottom: {}};
    for(var key in mealTypeData.areaData){
        mealTypeDataByArea.top[key] = mealTypeData.areaData[key].top;
        mealTypeDataByArea.bottom[key] = mealTypeData.areaData[key].bottom;
    }
    statList.topMealTypeByArea.value = mealTypeDataByArea.top;
    statList.bottomMealTypeByArea.value = mealTypeDataByArea.bottom;
    statList.percentageCollected.value = getPercentageCollected(postList, archiveData[0]);
    statList.usageByLocation.value = getUsageByLocation(postList);

    return statList;

}

function calcUserStats(postList){

    var statList = {
        foodTypeData: {hr: "Food Type Data", value: ""}, mealTypeData: {hr: "Meal Type Data", value: ""}
    };

    statList.foodTypeData.value = getFoodTypeDataUser(postList);
    statList.mealTypeData.value = getMealTypeDataUser(postList);

    return statList;

}

function getFoodTypeData(postList){
    var foodTypes = {
        dairy: {hr: "Dairy", value: 0},
        meat: {hr: "Meat", value: 0},
        fruit: {hr: "Fruit", value: 0},
        vegetables: {hr: "Vegetables", value: 0},
        snacks: {hr: "Snacks", value: 0},
        sweets: {hr: "Sweets", value: 0},
        drink: {hr: "Drink", value: 0}
    };
    var foodTypeData = {top: "", bottom: "", areaData: {}};
    var areas = {};

    for(var i = 0; i < postList.length; i++){
        var post = postList[i];

        if(!post.hasOwnProperty("location")){continue;}
        var city = post.location;
        if(!areas.hasOwnProperty(city)){
            areas[city] = {
                dairy: {hr: "Dairy", value: 0},
                meat: {hr: "Meat", value: 0},
                fruit: {hr: "Fruit", value: 0},
                vegetables: {hr: "Vegetables", value: 0},
                snacks: {hr: "Snacks", value: 0},
                sweets: {hr: "Sweets", value: 0},
                drink: {hr: "Drink", value: 0}
            };
            foodTypeData.areaData[city] = {top: "", bottom: ""};
        }

        if(post.mealtypefood !== null){
            switch(post.mealtypefood){
                case "dairy":
                    foodTypes.dairy.value += 1;
                    areas[city].dairy.value += 1;
                    break;
                case "meat":
                    foodTypes.meat.value += 1;
                    areas[city].meat.value += 1;
                    break;
                case "fruit":
                    foodTypes.fruit.value += 1;
                    areas[city].fruit.value += 1;
                    break;
                case "vegetables":
                    foodTypes.vegetables.value += 1;
                    areas[city].vegetables.value += 1;
                    break;
                case "snacks":
                    foodTypes.snacks.value += 1;
                    areas[city].snacks.value += 1;
                    break;
                case "sweets":
                    foodTypes.sweets.value += 1;
                    areas[city].sweets.value += 1;
                    break;
                case "drink":
                    foodTypes.drink.value += 1;
                    areas[city].drink.value += 1;
                    break;
            }
        }
    }

    var maxMT = {name: "", value: -Number.MAX_VALUE};
    var minMT = {name: "", value: Number.MAX_VALUE};
    for(var key in foodTypes){
        if(foodTypes[key].value >= maxMT.value){maxMT.name = foodTypes[key].hr; maxMT.value = foodTypes[key].value;}
        if(foodTypes[key].value <= minMT.value){minMT.name = foodTypes[key].hr; minMT.value = foodTypes[key].value;}
    }
    foodTypeData.top = maxMT.name;
    foodTypeData.bottom = minMT.name;

    for(var key in areas){
        var max = {name: "", value: -Number.MAX_VALUE};
        var min = {name: "", value: Number.MAX_VALUE};
        if(areas[key].dairy.value >= max.value){max.name = areas[key].dairy.hr; max.value = areas[key].dairy.value;}
        if(areas[key].meat.value >= max.value){max.name = areas[key].meat.hr; max.value = areas[key].meat.value;}
        if(areas[key].fruit.value >= max.value){max.name = areas[key].fruit.hr; max.value = areas[key].fruit.value;}
        if(areas[key].vegetables.value >= max.value){max.name = areas[key].vegetables.hr; max.value = areas[key].vegetables.value;}
        if(areas[key].snacks.value >= max.value){max.name = areas[key].snacks.hr; max.value = areas[key].snacks.value;}
        if(areas[key].sweets.value >= max.value){max.name = areas[key].sweets.hr; max.value = areas[key].sweets.value;}
        if(areas[key].drink.value >= max.value){max.name = areas[key].drink.hr; max.value = areas[key].drink.value;}
        if(areas[key].dairy.value <= min.value){min.name = areas[key].dairy.hr; min.value = areas[key].dairy.value;}
        if(areas[key].meat.value <= min.value){min.name = areas[key].meat.hr; min.value = areas[key].meat.value;}
        if(areas[key].fruit.value <= min.value){min.name = areas[key].fruit.hr; min.value = areas[key].fruit.value;}
        if(areas[key].vegetables.value <= min.value){min.name = areas[key].vegetables.hr; min.value = areas[key].vegetables.value;}
        if(areas[key].snacks.value <= min.value){min.name = areas[key].snacks.hr; min.value = areas[key].snacks.value;}
        if(areas[key].sweets.value <= min.value){min.name = areas[key].sweets.hr; min.value = areas[key].sweets.value;}
        if(areas[key].drink.value <= min.value){min.name = areas[key].drink.hr; min.value = areas[key].drink.value;}
        foodTypeData.areaData[key].top = max.name;
        foodTypeData.areaData[key].bottom = min.name
    }

    return foodTypeData;
}

function getMealTypeData(postList){
    var mealTypes = {
        breakfast: {hr: "Breakfast", value: 0},
        lunch: {hr: "Lunch", value: 0},
        dinner: {hr: "Dinner", value: 0},
        snack: {hr: "Snack", value: 0}
    };
    var mealTypeData = {top: "", bottom: "", areaData: {}};
    var areas = {};

    for(var i = 0; i < postList.length; i++){
        var post = postList[i];

        if(!post.hasOwnProperty("location")){continue;}
        var city = post.location;
        if(!areas.hasOwnProperty(city)){
            areas[city] = {
                breakfast: {hr: "Breakfast", value: 0},
                lunch: {hr: "Lunch", value: 0},
                dinner: {hr: "Dinner", value: 0},
                snack: {hr: "Snack", value: 0}
            };
            mealTypeData.areaData[city] = {top: "", bottom: ""};
        }

        if(post.mealtype !== null){
            switch(post.mealtype){
                case "breakfast":
                    mealTypes.breakfast.value += 1;
                    areas[city].breakfast.value += 1;
                    break;
                case "lunch":
                    mealTypes.lunch.value += 1;
                    areas[city].lunch.value += 1;
                    break;
                case "dinner":
                    mealTypes.dinner.value += 1;
                    areas[city].dinner.value += 1;
                    break;
                case "snack":
                    mealTypes.snack.value += 1;
                    areas[city].snack.value += 1;
                    break;
            }
        }
    }

    var maxMT = {name: "", value: Number.MIN_VALUE};
    var minMT = {name: "", value: Number.MAX_VALUE};
    for(var key in mealTypes){
        if(mealTypes[key].value >= maxMT.value){maxMT.name = mealTypes[key].hr; maxMT.value = mealTypes[key].value;}
        if(mealTypes[key].value <= minMT.value){minMT.name = mealTypes[key].hr; minMT.value = mealTypes[key].value;}
    }
    mealTypeData.top = maxMT.name;
    mealTypeData.bottom = minMT.name;

    for(var key in areas){
        var max = {name: "", value: Number.MIN_VALUE};
        var min = {name: "", value: Number.MAX_VALUE};
        if(areas[key].breakfast.value >= max.value){max.name = areas[key].breakfast.hr; max.value = areas[key].breakfast.value;}
        if(areas[key].lunch.value >= max.value){max.name = areas[key].lunch.hr; max.value = areas[key].lunch.value;}
        if(areas[key].dinner.value >= max.value){max.name = areas[key].dinner.hr; max.value = areas[key].dinner.value;}
        if(areas[key].snack.value >= max.value){max.name = areas[key].snack.hr; max.value = areas[key].snack.value;}
        if(areas[key].breakfast.value <= min.value){min.name = areas[key].breakfast.hr; min.value = areas[key].breakfast.value;}
        if(areas[key].lunch.value <= min.value){min.name = areas[key].lunch.hr; min.value = areas[key].lunch.value;}
        if(areas[key].dinner.value <= min.value){min.name = areas[key].dinner.hr; min.value = areas[key].dinner.value;}
        if(areas[key].snack.value <= min.value){min.name = areas[key].snack.hr; min.value = areas[key].snack.value;}
        mealTypeData.areaData[key].top = max.name;
        mealTypeData.areaData[key].bottom = min.name
    }

    return mealTypeData;
}

function getPercentageCollected(postList, archiveData){

    var totalNumberOfPosts = postList.length + archiveData.deletedPostsAmount;
    var totalCollectedPosts = archiveData.collectedPostsAmount;

    var percentageCollected = (totalCollectedPosts / totalNumberOfPosts * 100);

    return  Number(Math.round(percentageCollected+'e2')+'e-2') + "%";

}

function getUsageByLocation(postList){
    var usage = {};

    for(var i = 0; i < postList.length; i++) {
        var post = postList[i];
        if(!post.hasOwnProperty("location")){continue;}
        var city = post.location;

        if(!usage.hasOwnProperty(city)){
            usage[city] = 1;
        } else {
            usage[city] += 1;
        }

    }

    return usage;
}

function getStatsByUser(postList, username){
    var filteredPostList = [];
    for(var i = 0; i < postList.length; i++){
        if(postList[i].username === username){
            filteredPostList.push(postList[i]);
        }
    }
    return filteredPostList;
}

function getFoodTypeDataUser(postList){
    var foodTypes = {
        dairy: {hr: "Dairy", value: 0},
        meat: {hr: "Meat", value: 0},
        fruit: {hr: "Fruit", value: 0},
        vegetables: {hr: "Vegetables", value: 0},
        snacks: {hr: "Snacks", value: 0},
        sweets: {hr: "Sweets", value: 0},
        drink: {hr: "Drink", value: 0}
    };

    for(var i = 0; i < postList.length; i++){
        var post = postList[i];

        if(!post.collected) {
            if (post.mealtypefood !== null) {
                switch (post.mealtypefood) {
                    case "dairy":
                        foodTypes.dairy.value += 1;
                        break;
                    case "meat":
                        foodTypes.meat.value += 1;
                        break;
                    case "fruit":
                        foodTypes.fruit.value += 1;
                        break;
                    case "vegetables":
                        foodTypes.vegetables.value += 1;
                        break;
                    case "snacks":
                        foodTypes.snacks.value += 1;
                        break;
                    case "sweets":
                        foodTypes.sweets.value += 1;
                        break;
                    case "drink":
                        foodTypes.drink.value += 1;
                        break;
                }
            }
        }
    }

    return foodTypes;
}

function getMealTypeDataUser(postList){
    var mealTypes = {
        breakfast: {hr: "Breakfast", value: 0},
        lunch: {hr: "Lunch", value: 0},
        dinner: {hr: "Dinner", value: 0},
        snack: {hr: "Snack", value: 0}
    };

    for(var i = 0; i < postList.length; i++){
        var post = postList[i];

        if(!post.collected) {
            if (post.mealtype !== null) {
                switch (post.mealtype) {
                    case "breakfast":
                        mealTypes.breakfast.value += 1;
                        break;
                    case "lunch":
                        mealTypes.lunch.value += 1;
                        break;
                    case "dinner":
                        mealTypes.dinner.value += 1;
                        break;
                    case "snack":
                        mealTypes.snack.value += 1;
                        break;
                }
            }
        }
    }

    return mealTypes;
}