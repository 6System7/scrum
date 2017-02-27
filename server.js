//Get required packages
var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + "/";

var express = require('express');
var app = express();
var savedRes;

//Router to direct requests
router.use(function (req,res,next) {
  next();
});

//If request to /function
//router.get("/function",function(req,res){
//    savedRes = res;
//});

//Direct requests to various urls
router.get("/",function(req,res){
    //res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:8080');
    res.sendFile(path + "home.html");    
});
router.get("/home.html",function(req,res){
    //res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:8080');
    res.sendFile(path + "home.html");    
});
router.get("/findfood.html",function(req,res){
    //res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:8080');
    res.sendFile(path + "findfood.html");    
});
router.get("/postfood.html",function(req,res){
    //res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:8080');
    res.sendFile(path + "postfood.html");    
});
router.get("/account.html",function(req,res){
    //res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:8080');
    res.sendFile(path + "account.html");    
});


//Send initial files to use such as bootstrap
app.use("/",router);
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

//Start server and listen on port 8080
app.listen(process.env.PORT || 8080,function(){
  console.log("Live at Port 8080");
});

