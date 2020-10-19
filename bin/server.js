/**********************************************************************************************
 *	Filename	: server.js							
 *	Author		: Sathrak paldurai K
 *	Date		: 26-07-2018								
 *	Description	: Chat Server.
***********************************************************************************************/
	var fs 			= require( 'fs' );	
	var async 		= require('async');	
	module.exports = (io,generic)=>{
		var sockcnt = 0;
		var clinet = {};
		io.use(function(socket, next){
			console.log(socket.handshake.query);	
			if (socket.handshake.query && socket.handshake.query.userId){
				var Id = socket.handshake.query.userId;
				socket.userid = Id;
				return next();
			}else{		
				next(new Error('Authentication error'));
			}
		}).on('connection', function(socket) {
			sockcnt++;
			
			socket.on('openroom', function(data,callback){
				console.error("openroom==========", data);
				var roomId = data.roomId;
				var userId = data.userId;
				if(callback)
					callback({RESPONSE:"bmRtcCall Emit is success."});
				if(data.callType!=1 && !bmgeneric.empty(roomId)){
					//var data = (!bmgeneric.empty(req.body)) ? req.body : req.query;
					//console.error("getofferice==========",data);
					async.parallel({
						getOffer: function (callback) {
							var memKey = "bmOffer"+roomId;
							Cache.get(roomId,memKey, function(err, bmoffer){
								console.error("Cache======bmOffer=====",bmoffer);
								if(bmoffer!=undefined && bmoffer!=false){
									socket.emit('respRtcCall', {roomId:roomId,rtcSDP:bmoffer.rtcSDP,JSONTYPE:13},function(resp){
										console.error("respRtcCall sucess:",resp);
									});
								}
								callback(err,null);
							});
						},
						getIce: function (callback) {
							var memKey = "bmIce"+roomId;
							Cache.get(roomId,memKey, function(err, Icecant){
								console.error("Cache======bmIce=====",Icecant);
								Icecant.forEach(function(msgdata){
									socket.emit('respICECandidate', {roomId:roomId,ice_candidate:msgdata.ice_candidate,JSONTYPE:17},function(resp){
										console.error("respICECandidate sucess:",resp);
									});
								});
								callback(err,null);
							});						}
					}, function (error, sendResp) {
					});	
				}
				
			});

			/*
			Client Emit:
				socket.emit('bmRtcCall',{,'roomId':<RTC Id>,gender:gender,appType:104,"uTime":1531124297934,"rtcSDP":<session description>,"eType":"F",CallType:"<Video/Voice>"},pRegId:<App Register Id>,sName:<User Name>,sImage:<User Image>,'pDeviceId':<partner DeviceId>,'pAppType':<partner AppType>,function(resp){});
			
			Server Emit to Sender :		
				socket.emit('BmCallResponse', {,'roomId':<RTC Id>,callInitTime:mTime,callSend:2,JSONTYPE:13});		
			Server Emit to Partner:
				socket.emit('respRtcCall', {emit:'respRtcCall',callType:"<Video/Voice>",,'roomId':<RTC Id>,rtcSDP:<sdp>,sName:<sender Name>,sImage:<ssender Image>,uRegId:regId,deviceId:pDeviceId,uAppType:appType,callInitTime:<Server Time>,JSONTYPE:14},function(resp){
				console.log("respRtcCall sucess",resp);});
			*/
			socket.on('bmRtcCall', function(data,callback){
				console.error("bmRtcCall==========", data);
				var rtcSDP = data.rtcSDP;
				var roomId = data.rId;
				var sName = data.sName;
				var sImage = data.sImage;
				var regId = data.pRegId;			
				var pDeviceId = (generic.empty(data.pDeviceId)) ? 0 : data.pDeviceId;			
				var appType = parseInt(data.pAppType);
				var callType = data.CallType;		
				callback({RESPONSE:"bmRtcCall Emit is success."});
				if(callType==1){
					var memkey = "bmOffer"+roomId;
					Cache.set(roomId,memkey,{rtcSDP:rtcSDP},2000);	
				}
				/*if(!generic.empty(rtcSDP)){
					if(global.RABMQVOICE){
						var qmsg = JSON.stringify({emit:'respRtcCall',callType:callType,rtcSDP:rtcSDP,roomId:roomId,sName:sName,sImage:sImage,uRegId:regId,deviceId:pDeviceId,uAppType:appType,callInitTime:mTime,resend:reSend,JSONTYPE:14});
						var setNotMsg = {"callType":callType,"sendername":sName,"rtcSDP":(callType==3)? 'AppKill' : rtcSDP,"timestamp":mTime,"roomId":roomId,"messagetype":"79","landing":"1","senderimage":sImage};
						var key = 'lib_'+data.pId;						
						global.RABMQVOICE.then(function(ch) {	
							var ex = 'direct_logs';							
							ch.publish(ex, key, new Buffer(qmsg), {deliveryMode:2,timestamp:mTime,mandatory:true},function(err,ok){
								if (err) console.error("Message Publish Error:",err);
								console.error("BmCallResponse===========:");
								socket.emit('respRtcCall', {RESPONSECODE:1,ERRCODE:0,roomId:roomId,callInitTime:mTime,callSend:1,resend:reSend,rType:"RABBITMQ",JSONTYPE:13});
							});							
						});
					} else {
						socket.emit('BmCallResponse', {RESPONSECODE:2,ERRCODE:1,roomId:roomId,resend:reSend,JSONTYPE:13});
					}
				
				}else{
					socket.emit('BmCallResponse', {RESPONSECODE:2,ERRCODE:2,roomId:data.roomId,JSONTYPE:13});
				}*/
			});
		
			
			/*
			Client Emit :	   
				socket.emit('bmCallAnswer',{,uTime:<1531124297934>,roomId:<RTC Id>,"rtcSDP":<session description>,'pRegId':<partner RegId>,callInitTime:<callInitTime>,appType:104},function(resp){});
			Server Emit to Sender:
				socket.emit('bmCallAnswerResponse', {RESPONSECODE:1,ERRCODE:0,roomId:data.roomId,JSONTYPE:16});
			Server Emit to Partner:
				socket.emit('respCallAnswer',{emit:'respCallAnswer',rtcSDP:rtcSDP,uRegId:regId,JSONTYPE:14});
			*/		
			socket.on('bmCallAnswer', function(data,callback)  {
				console.error("bmCallAnswer==========", data);
				var rtcSDP = data.rtcSDP;
				var rtcId = data.rtcId;
				var uId = data.uId;
				var roomId = data.rId;
				callback({RESPONSE:"bmCallAnswer Emit is success."});
				if(!generic.empty(uId) && !generic.empty(roomId) && !generic.empty(rtcSDP)){
					if(global.APPRABMQ){
						var qmsg = JSON.stringify({emit:'respCallAnswer',rtcSDP:rtcSDP,roomId:roomId,JSONTYPE:15});
						var key = 'lib_'+roomId;
						global.APPRABMQ.then(function(ch) {
							var ex = 'direct_logs';	
							socket.emit('bmCallAnswerResponse', {RESPONSECODE:1,ERRCODE:0,roomId:roomId,JSONTYPE:16});
							ch.publish(ex, key, new Buffer(qmsg), {deliveryMode: 2, mandatory: true}, (err) => {
								if (err) 
									console.error("Message Publish Error:",err);
							});
						});
					} else{
						socket.emit('bmCallAnswerResponse', {RESPONSECODE:2,ERRCODE:1,roomId:roomId,JSONTYPE:16});
					}
				}else{
					socket.emit('bmCallAnswerResponse', {RESPONSECODE:2,ERRCODE:2,roomId:data.roomId,JSONTYPE:16});
				}
			});

			/*
			client Emit :  
				socket.emit('bmICECandidate',{,uTime:<1531124297934>,roomId:<RTC Id>,"ice_candidate":<ice_candidate>,appType:104},function(resp){});
			Server Emit :
				socket.emit('respICECandidate',{,roomId:<RTC Id>,"ice_candidate":<ice_candidate>},function(resp){});
			*/	
			socket.on('bmICECandidate', function(config, callback) {
				console.error("relayICECandidate==========",config);
				var ice_candidate = config.ice_candidate;
				var roomId = config.rId;
				if(callback)
					callback({RESPONSE:"bmICECandidate Emit is success."});
					
				if(config.CallType==1){
					var memKey ="bmIce"+roomId;
					Cache.get(roomId,memKey, function(err, ice_cant){
						if(!err){
							if(ice_cant!=undefined && ice_cant!=false){
								ice_cant.push({ice_candidate:ice_candidate});
							} else{
								var ice_cant = [];
								ice_cant.push({ice_candidate:ice_candidate});
							}
							console.error("ice_cant=============:",ice_cant);
							Cache.set(roomId,memKey,ice_cant,2000);	
						}else{
							console.error("Memcached Error:",err);
						}
					});
				} else {
					if(global.APPRABMQ){
						var qmsg = JSON.stringify({emit:'respICECandidate','ice_candidate': ice_candidate,'roomId':roomId,JSONTYPE:17});
						var queue_name = 'lib_'+roomId;				
						global.APPRABMQ.then(function(ch) {
							var mTime = generic.millisecTime();					
							var ex = 'direct_logs';						
							ch.publish(ex, queue_name, new Buffer(qmsg),{
								deliveryMode: 2,
								mandatory: true,
								timestamp:mTime,
							}, (err) => {
								if (err)
									console.error("Message Publish icc Error:", err);
							});
						});
					}
				}
				/*} else{
					console.error("gm-chat rabbitMQ Send conn 1 is Empty:",UserId+RecId)
				}*/
			});

			socket.on('bmCallAttend', function(data, callback) {
				console.error('bmCallAttend================',data);							
				var roomId = data.roomId;		
				var cInitTime = data.callInitTime;
				if(callback)
					callback({RESPONSE:"respCallAttend Emit is success."});
				/*if(!generic.empty(uId) && !generic.empty(pId) && !generic.empty(roomId)){
					if(global.APPRABMQ){				
						var qmsg = JSON.stringify({emit:'respCallAttend','roomId':data.roomId,JSONTYPE:20});
						var queue_name = 'lib_'+data.pId;				
						global.APPRABMQ.then(function(ch) {						
							var ex = 'direct_logs';						
							ch.publish(ex, queue_name, new Buffer(qmsg));
						});						
					} else{
						console.error("gm-chat rabbitMQ Send conn 1 is Empty:",UserId+RecId)
					}
				}*/
			});
			
			
			/*
			Client Emit : 
				socket.emit('bmCallEnd', {callType:"<Video/Voice>",uId:<Login Id>, pId:<Partner Id>,roomId:<RTC Id>,cDuration:<Total Call Time>,cEndTime:<MilliSec>,JSONTYPE:15},function(resp){
					console.log("bmCallEnd sucess",resp);
				});
			server Emit to Sender :
				socket.emit('BmEndResponse', {RESPONSECODE:1,ERRCODE:0,roomId:data.roomId,JSONTYPE:15});

			Server Emit to Partner:
				socket.emit('bmCallEnd', {emit:'bmCallEnd', roomId:data.roomId,uRegId:regId,JSONTYPE:14},function(resp){console.log("bmCallEnd sucess",resp);});	
			*/		
			socket.on('bmCallEnd', function(data,callback)  {
				console.error("bmCallEnd==========", data);				
				var roomId = data.roomId;
				var regId = data.pRegId;
				var appType = parseInt(data.pAppType);
				var cInitTime = data.callInitTime;
				var bmBusy = data.busy;
				var bmCallDur = data.cDuration;
				var callType = data.callType;
				callback({RESPONSE:"bmCallEnd Emit is success."});	
				if(!generic.empty(uId) && !generic.empty(pId) && !generic.empty(roomId)){
					if(global.RABMQVOICE){
						var key = 'lib_'+data.pId;
						var qmsg = JSON.stringify({emit:'respCallEnd',roomId:data.roomId,uRegId:regId,busy:bmBusy,cDuration:bmCallDur,callType:data.callType,JSONTYPE:19});
						var setNotMsg = {"timestamp":cInitTime,"roomId":roomId,"callType":callType,"messagetype":"79","landing":"2"};									
						global.RABMQVOICE.then(function(ch) {	
							var ex = 'direct_logs';	
							socket.emit('BmEndResponse', {RESPONSECODE:1,ERRCODE:0,roomId:data.roomId,JSONTYPE:18});
							ch.publish(ex, key, new Buffer(qmsg), {deliveryMode: 2, mandatory: true}, (err) => {
								if (err) console.error("Message Publish Error:",err);
								console.error('Message processed');
							});
						
						});
					}else{
						socket.emit('BmEndResponse', {RESPONSECODE:2,ERRCODE:1,roomId:data.roomId,JSONTYPE:18});
					}
					/*var senderId = roomId.split('_');
					if(!generic.empty(senderId) && callType==3){
						if(senderId[0] == uId){						
							Cache.deleted(uId,"bmOffer"+uId+"_"+pId);	
							Cache.deleted(uId,"bmIce"+uId+"_"+pId);	
						}else{					
							Cache.deleted(pId,"bmOffer"+pId+"_"+uId);	
							Cache.deleted(pId,"bmIce"+pId+"_"+uId);
						}
					}*/
				}else{
					socket.emit('BmEndResponse', {RESPONSECODE:2,ERRCODE:2,roomId:data.roomId,JSONTYPE:18});
				}
			});
		
			/*
			client Emit :  
				socket.emit('bmRtcError',{,uTime:<1531124297934>,roomId:<RTC Id>,appType:104,RTCErr:<First Parameter>,Type:<Second Parameter>,ErrCode:<Third Parameter>},function(resp){});
			Server Emit :
				socket.emit('respRtcError',{,roomId:<RTC Id>,function(resp){})
			*/
			socket.on('bmRtcError', function(config, callback) {
				console.error("bmRtcError==========",config);
				if(callback)
					callback({RESPONSE:"bmRtcError Emit is success."});
				if(config.Type && config.RTCErr){
					console.error("bmRtcError==========",config);
				}else{
					if(global.APPRABMQ){
						var qmsg = JSON.stringify({emit:'respRtcError',roomId:config.roomId,JSONTYPE:21});
						var queue_name = 'lib_'+config.roomId;				
						global.APPRABMQ.then(function(ch) {						
							var ex = 'direct_logs';						
							ch.publish(ex, queue_name, new Buffer(qmsg));
						});						
					} else{
						console.error("gm-chat rabbitMQ Send conn 1 is Empty:",UserId+RecId)
					}
				}	
			});
					
			socket.on('disconnect', function () {			
				sockcnt = sockcnt - 1;
				console.error(socket.userid,"Member Disconnect - Socket Count :",socket.id);
				delete socket[socket.id];	
			})

			

			/**
			* Initialize subscriber queue.
			* 1. First Connect the set the Exchange name direct or fanout or topic
			* 2. First create a queue w/o any name. This forces RabbitMQ to create new queue for every socket.io connection w/ a new random queue name.
			* 3. Then bind the queue to chatExchange  w/ "#" or "" 'Binding key' and listen to ALL messages
			* 4. Lastly, create a consumer (via .consume) that waits for messages from RabbitMQ. And when
			* a message comes, send it to the browser.
			*
			* Note: we are creating this w/in io.on('connection'..) to create NEW queue for every connection
			*/
			var ruserId = socket.userid;
			
			if(generic.empty(clinet[ruserId])){
				console.log("socket connect cnt:"+clinet[ruserId]);
			}
			console.log(typeof(APPRABMQ),"socket.userid==================",socket.userid);
			if(APPRABMQ && ruserId){
				clinet[ruserId] = socket.id;
				var ex = 'direct_logs';						
				var key = 'lib_'+ruserId;					
				APPRABMQ.then(function(ch) {
					//Connect the Exchange direct or fanout or topic
					var aeok = ch.assertExchange(ex, 'direct', {durable: false});
					aeok.then(function() {						
						var aqok = ch.assertQueue('',{exclusive: true});
						aqok.then(function(q) {
							socket.queueid = q.queue;
							//Bind to chatExchange w/ "#" or "" binding key to listen to all messages.
							ch.bindQueue(q.queue, ex, key);
							//Subscribe When a message comes, send it back to browser
							ch.consume(q.queue, function(msg) {
								if (msg !== null) {										
									var encodemsg = msg.content.toString();
									var quemsg = JSON.parse(encodemsg);
									console.log("quemsg==================",quemsg);
									if(!generic.empty(quemsg)){
										if(quemsg.emit){
											socket.emit(quemsg.emit,quemsg,function(rresp){});
										} else{
											socket.emit('RESPRECEIVER',{RC:1,ER:0,MSG:[quemsg]},function(rresp){});
										}
									} 							
								} else {
									socket.emit('RESPRECEIVER',{RC:1,ER:0},function(rresp){});
								}
							}, {noAck: true});
						});
					});
				});					
			} else{
				console.error("APP - Receiver RabbitMQ Connection is Empty:"+ruserId);
				socket.emit('RESPRECEIVER',{RC:1,ER:2},function(rresp){});
			}
		});
	};