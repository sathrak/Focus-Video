/************************************************************************************************
File    : mongodbclass.js
Author	: Sathrak paldurai K
Date	: 12-09-2016	
***********************************************************************************************
Description: Main config files for NodeChat contains db informations, static variable and cookie set info.
***********************************************************************************************/
const mongoose = require('mongoose');	//mongoose@5.0.3
let tableschema	= require('./mongotableschema.js');

let optionsdB = {		
    autoReconnect : true,
    poolSize: 10,
    keepAlive: true,
    reconnectTries: 30,		
    bufferMaxEntries: 0,
    useNewUrlParser: true
}		

/******   Global Connect to messenger database in mongodb Start  ***********/
var dbMessenger = mongoose.createConnection('mongodb://localhost/messenger',optionsdB);
dbMessenger.on('open', function () {
    console.log("Messenger is connected and ready at: "+new Date());
});

dbMessenger.on('error', function(err) {
    console.log("Messenger connection Error at: "+new Date(), err);
});

dbMessenger.on('close', function(str) {
    console.log("Messenger Disconnected at: "+new Date(),str);
});

let userstatus_table = tableschema.getSchema(mongoose,dbMessenger,'userstatus1');

let chatmessage_table = tableschema.getSchema(mongoose,dbMessenger,'messagedet1');
        
/****Global Connect to messenger database in mongodb End*****/	

module.exports = class mongoDb {	
    /* User Status collection select / insert / update /delete Function start*/
    //var whereval = {_id:uId};
    getUser(whereval,next){
        userstatus_table.findOne(whereval, function(err, getData)
        {
            if(err){
                console.log("Error : at mongo getUser Function : "+err.stack);				
                var err = {"error":"Could not send message at this time! Please try again later!"};
                next(err,getData);			
            }else{					
                next(err,getData);			
            }
        });	
    }

    getUsers(whereval,next){
        userstatus_table.find(whereval,{Password:0,_id:0}, function(err, getData)
        {
            if(err){
                console.log("Error : at mongo getUser Function : "+err.stack);				
                var err = {"error":"Could not send message at this time! Please try again later!"};
                next(err,getData);			
            }else{					
                next(err,getData);			
            }
        });	
    }
    
    setUser(insertData,next){
        userstatus_table.collection.insertOne(insertData, function(err, result){	
            if(err){	
                var outputid = JSON.stringify({Login:"Login",Success:0});
                console.error("Err at :MogoDB: setUser function! insert MatriId: "+err.stack);	
            }else{
                var outputid = JSON.stringify({Login:"Login",Success:1});
            }
            next(err, outputid);
        });
    }
    
    //whereval = {"_id":mid}
    updUser(userId,whereval,setupdate,next){
        userstatus_table.updateOne(whereval,setupdate,{multi:false,upsert:true,safe:true}, function(err, resDet)
        {
            if (err) {					
                console.error("error at userstatus update : updUser function:",err);
            }
            next(err,true);
        });  
    }
    
    delUser(userId,whereval,next){
        userstatus_table.remove(whereval, function(err, resDet){
            if(err){
                console.log("Err : delUser :at Read status userstatus online status update: "+err.stack);
            }
            next(err,true);
        });
    }

    getUserCnt(whereval,next){
        userstatus_table.count(whereval, function(err, getData){
            if(err){
                console.log("Error : at mongo getMsg Function : "+err.stack);				
                var err = {"error":"Could not send message at this time! Please try again later!"};
                next(err,getData);			
            }else{					
                next(err,getData);
            }
        });	
    }
    /* User Status collection select / insert / update /delete Function End*/
    
    /* chat message det collection select / insert / update /delete Function start*/
    getMsg(userId,whereval,selFields,next){
        chatmessage_table.find(whereval,selFields,{$orderby :{msgTime : -1}}, function(err, getData)
        {
            if(err){
                console.log("Error : at mongo getMsg Function : "+err.stack);				
                var err = {"error":"Could not send message at this time! Please try again later!"};
                next(err,getData);			
            }else{					
                next(err,getData);			
            }
        });	
    }
    
    getMsgCnt(userId,whereval,next){
        chatmessage_table.count(whereval, function(err, getData)
        {
            if(err){
                console.log("Error : at mongo getMsg Function : "+err.stack);				
                var err = {"error":"Could not send message at this time! Please try again later!"};
                next(err,getData);			
            }else{					
                next(err,getData);			
            }
        });	
    }
    
    getMsgAgg(userId,whereval,groupby,sort,sLimit,eLimit,next){
        chatmessage_table.aggregate([
            {$match: whereval},
            {$group: groupby},
            {$sort : sort},
            {$limit : sLimit},
            {$skip : eLimit}
        ], function (err, getData) {				
            if(err){
                console.error("Error : at mongo getMsgAgg Function : "+err.stack);				
                var err = {"error":"Could not send message at this time! Please try again later!"};
                next(err,getData);			
            }else{					
                next(err,getData);			
            }
        });
    }
    
    getMsgAggCnt(userId,whereval,sort,next){			
        chatmessage_table.aggregate([
            {$match: whereval},
            {$group: sort},
            {$count:'Total'}
        ], function (err, getData) {
            next(err,getData);	
        });
    }
    
    
    setMsg(userId,insertData,next){
        chatmessage_table.collection.insertOne(insertData, function(err, result){	
            if(err){	
                var outputid = {Login:"Login",Success:0};
                console.error("Err at :MogoDB: setMsg function! insert MatriId:"+userId+" :: "+err.stack);	
            }else{
                var outputid = {Login:"Login",Success:1};
            }
            next(err, outputid);
        });
    }
    
    //whereval = {"_id":mid}
    updMsg(userId,whereval,setupdate,next){
        chatmessage_table.updateOne(whereval,{$set:setupdate},{multi: true,upsert: true, safe: true}, function(err, resDet)
        {
            if (err) {					
                console.error("error at updMsg update : updMsg function:",err);
            }
            next(err,resDet);
        });  
    }
    
    updMsgMult(userId,whereval,setupdate,next){
        chatmessage_table.updateMany(whereval,setupdate,{multi: true,upsert: true, safe: true}, function(err, resDet)
        {
            if (err) {					
                console.error("error at updMsg update : updMsg function:",err);
            }
            next(err,true);
        });  
    }		
    
    delMsg(userId,whereval,next){
        chatmessage_table.remove(whereval, function(err, resDet){
            if(err){
                console.log("Err : delMsg :at Read status delMsg : "+err.stack);
            }
            next(err,true);
        });
    }
    /* chat message det collection select / insert / update /delete Function End*/
}
