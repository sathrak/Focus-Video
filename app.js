/**********************************************************************************************
 *	Filename	: index.js							
 *	Author		: Sathrak paldurai K
 *	Date		: 04-07-2018								
 *	Description	: Chat Server.
***********************************************************************************************/	
	const fs = require('fs');
	const path = require('path');
	const express 	= require('express');		
	const bodyParser 	= require('body-parser');
	var cookieParser = require('cookie-parser');
	const url = require('url');
	var httpServer = require('http');
	var app = express();
	const ioServer = require('socket.io');
	const RTCMultiConnectionServer = require('rtcmulticonnection-server');

	/* Libbm & Generic files included */
	const bmgeneric = require('./lib/funcgeneric.js');
	const mongoDB = require('./lib/mongodbclass.js');	

	var PORT = 8080;
	var isUseHTTPs = true;

	const jsonPath = {
		config: 'config.json',
		logs: 'logs.json'
	};

	const BASH_COLORS_HELPER = RTCMultiConnectionServer.BASH_COLORS_HELPER;
	const getValuesFromConfigJson = RTCMultiConnectionServer.getValuesFromConfigJson;
	const getBashParameters = RTCMultiConnectionServer.getBashParameters;
	const resolveURL = RTCMultiConnectionServer.resolveURL;

	var config = getValuesFromConfigJson(jsonPath);
	config = getBashParameters(config, BASH_COLORS_HELPER);

	// if user didn't modifed "PORT" object
	// then read value from "config.json"
	if(PORT === 8080) {
		PORT = config.port;
	}
	if(isUseHTTPs === false) {
		isUseHTTPs = config.isUseHTTPs;
	}

	var amqplib 	= require('amqplib');		
	var start = +new Date();
	amqplib.connect('amqp://admin:admin@192.168.20.65:5672?heartbeat=60').then(function(conn) {
		conn.on("error", function(err) {
			if (err.message !== "Connection closing") {
				console.error("Rabbit MQ Connection error", err.message);
			}
		});		
		conn.on("close", function() {
			console.error("Rabbit MQ reconnecting");
			process.exit();
        });
        var end = +new Date();
		console.log("Rabbit MQ Connection Time " + (end-start) + " milliseconds");
		APPRABMQ = conn.createChannel();	
	}).then(null, console.warn);

	/*function serverHandler(request, response) {
		// to make sure we always get valid info from json file
		// even if external codes are overriding it
		config = getValuesFromConfigJson(jsonPath);
		config = getBashParameters(config, BASH_COLORS_HELPER);

		// HTTP_GET handling code goes below
		try {
			var uri, filename;

			try {
				if (!config.dirPath || !config.dirPath.length) {
					config.dirPath = null;
				}

				uri = url.parse(request.url).pathname;
				filename = path.join(config.dirPath ? resolveURL(config.dirPath) : process.cwd(), uri);
			} catch (e) {
				pushLogs(config, 'url.parse', e);
			}

			filename = (filename || '').toString();

			if (request.method !== 'GET' || uri.indexOf('..') !== -1) {
				try {
					response.writeHead(401, {
						'Content-Type': 'text/plain'
					});
					response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
					response.end();
					return;
				} catch (e) {
					pushLogs(config, '!GET or ..', e);
				}
			}

			if(filename.indexOf(resolveURL('/admin/')) !== -1 && config.enableAdmin !== true) {
				try {
					response.writeHead(401, {
						'Content-Type': 'text/plain'
					});
					response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
					response.end();
					return;
				} catch (e) {
					pushLogs(config, '!GET or ..', e);
				}
				return;
			}

			var matched = false;
			['/meet/', '/dev/', '/dist/', '/socket.io/', '/node_modules/canvas-designer/', '/admin/'].forEach(function(item) {
				if (filename.indexOf(resolveURL(item)) !== -1) {
					matched = true;
				}
			});

			// files from node_modules
			['RecordRTC.js', 'FileBufferReader.js', 'getStats.js', 'getScreenId.js', 'adapter.js', 'MultiStreamsMixer.js'].forEach(function(item) {
				if (filename.indexOf(resolveURL('/node_modules/')) !== -1 && filename.indexOf(resolveURL(item)) !== -1) {
					matched = true;
				}
			});

			if (filename.search(/.js|.json/g) !== -1 && !matched) {
				try {
					response.writeHead(404, {
						'Content-Type': 'text/plain'
					});
					response.write('404 Not Found: ' + path.join('/', uri) + '\n');
					response.end();
					return;
				} catch (e) {
					pushLogs(config, '404 Not Found', e);
				}
			}

			['Video-Broadcasting', 'Screen-Sharing', 'Switch-Cameras'].forEach(function(fname) {
				try {
					if (filename.indexOf(fname + '.html') !== -1) {
						filename = filename.replace(fname + '.html', fname.toLowerCase() + '.html');
					}
				} catch (e) {
					pushLogs(config, 'forEach', e);
				}
			});

			var stats;

			try {
				stats = fs.lstatSync(filename);

				if (filename.search(/meet/g) === -1 && filename.search(/admin/g) === -1 && stats.isDirectory() && config.homePage === '/demos/index.html') {
					if (response.redirect) {
						response.redirect('/meet/');
					} else {
						response.writeHead(301, {
							'Location': '/meet/'
						});
					}
					response.end();
					return;
				}
			} catch (e) {
				response.writeHead(404, {
					'Content-Type': 'text/plain'
				});
				response.write('404 Not Found: ' + path.join('/', uri) + '\n');
				response.end();
				return;
			}

			try {
				if (fs.statSync(filename).isDirectory()) {
					response.writeHead(404, {
						'Content-Type': 'text/html'
					});

					if (filename.indexOf(resolveURL('/meet/MultiRTC/')) !== -1) {
						filename = filename.replace(resolveURL('/meet/MultiRTC/'), '');
						filename += resolveURL('/meet/MultiRTC/index.html');
					} else if (filename.indexOf(resolveURL('/admin/')) !== -1) {
						filename = filename.replace(resolveURL('/admin/'), '');
						filename += resolveURL('/admin/index.html');
					} else if (filename.indexOf(resolveURL('/meet/dashboard/')) !== -1) {
						filename = filename.replace(resolveURL('/meet/dashboard/'), '');
						filename += resolveURL('/meet/dashboard/index.html');
					} else if (filename.indexOf(resolveURL('/meet/video-conference/')) !== -1) {
						filename = filename.replace(resolveURL('/meet/video-conference/'), '');
						filename += resolveURL('/meet/video-conference/index.html');
					} else if (filename.indexOf(resolveURL('/meet')) !== -1) {
						filename = filename.replace(resolveURL('/meet/'), '');
						filename = filename.replace(resolveURL('/meet'), '');
						filename += resolveURL('/meet/index.html');
					} else {
						filename += resolveURL(config.homePage);
					}
				}
			} catch (e) {
				pushLogs(config, 'statSync.isDirectory', e);
			}

			var contentType = 'text/plain';
			if (filename.toLowerCase().indexOf('.html') !== -1) {
				contentType = 'text/html';
			}
			if (filename.toLowerCase().indexOf('.css') !== -1) {
				contentType = 'text/css';
			}
			if (filename.toLowerCase().indexOf('.png') !== -1) {
				contentType = 'image/png';
			}

			fs.readFile(filename, 'binary', function(err, file) {
				if (err) {
					response.writeHead(500, {
						'Content-Type': 'text/plain'
					});
					response.write('404 Not Found: ' + path.join('/', uri) + '\n');
					response.end();
					return;
				}

				try {
					file = file.replace('connection.socketURL = \'/\';', 'connection.socketURL = \'' + config.socketURL + '\';');
				} catch (e) {}

				response.writeHead(200, {
					'Content-Type': contentType
				});
				response.write(file, 'binary');
				response.end();
			});
		} catch (e) {
			pushLogs(config, 'Unexpected', e);

			response.writeHead(404, {
				'Content-Type': 'text/plain'
			});
			response.write('404 Not Found: Unexpected error.\n' + e.message + '\n\n' + e.stack);
			response.end();
		}
	}*/

	var httpApp;
	if (isUseHTTPs) {
		httpServer = require('https');

		// See how to use a valid certificate:
		// https://github.com/muaz-khan/WebRTC-Experiment/issues/62
		var options = {
			key: null,
			cert: null,
			ca: null
		};

		var pfx = false;

		if (!fs.existsSync(config.sslKey)) {
			console.log(BASH_COLORS_HELPER.getRedFG(), 'sslKey:\t ' + config.sslKey + ' does not exist.');
		} else {
			pfx = config.sslKey.indexOf('.pfx') !== -1;
			options.key = fs.readFileSync(config.sslKey);
		}

		if (!fs.existsSync(config.sslCert)) {
			console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCert:\t ' + config.sslCert + ' does not exist.');
		} else {
			options.cert = fs.readFileSync(config.sslCert);
		}

		if (config.sslCabundle) {
			if (!fs.existsSync(config.sslCabundle)) {
				console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCabundle:\t ' + config.sslCabundle + ' does not exist.');
			}

			options.ca = fs.readFileSync(config.sslCabundle);
		}

		if (pfx === true) {
			options = {
				pfx: sslKey
			};
		}
		httpApp = httpServer.createServer(options, app);
	} else {
		httpApp = httpServer.createServer(app);
	}

	// parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({extended:true}));
	
	// parse application/json
	app.use(bodyParser.json());
	
	app.use(cookieParser());
	console.log("__dirname========",__dirname);
	app.set('views', __dirname+'/views');
	app.set('view engine', 'ejs')
	// Tell Server that we are actually rendering HTML files through EJS.
	app.engine('html', require('ejs').renderFile);
	
	app.use(express.static(path.join(__dirname,'/public')));
	
	app.get('/', function(req, res){
		console.log("Welcome to chat Server");
		console.log('Cookies: ', req.cookies);
		if(req.cookies.FSID && req.cookies.FSNAME){
			res.cookie("context", "myContext", { httpOnly: true });
			res.render('home.ejs',{Id:req.cookies.FSID,EmailId:req.cookies.FSNAME,Name:req.cookies.FSNAME});
			//res.render('/home?Id='+req.cookies.FSID+'&EmailId='+req.cookies.FSNAME+'&Name='+req.cookies.FSNAME);
		} else{
			res.render('login.ejs');
		}
	});

	app.get('/logout',function(req, res){
		console.log("Logout==============",req.cookies);
		res.clearCookie("FSID",{ path: '/' });
		res.clearCookie("FSNAME",{ path: '/' });
		var myDate = new Date();
		res.cookie("FSID", '',{expires:myDate, domain:'.bharatmatrimony.com', path:'/'});
		res.cookie("FSNAME", '',{expires:myDate, domain:'.bharatmatrimony.com', path:'/'});
		res.render('login.ejs');
	});

	app.post('/login', function(req, res){
		var data = (!bmgeneric.empty(req.body)) ? req.body : req.query;	
		console.error("login====start=====",req.body);
		var mongobj = new mongoDB();
		var whereval = {Name:data.username,Password:bmgeneric.encrypt(data.password),Status:1};
		mongobj.getUser(whereval,function(err,reslt){
			if(!err) {
				if(!bmgeneric.empty(reslt)){
					var myDate = new Date();
					myDate.setMonth(myDate.getMonth() + 1);
					console.log("getUsers err===================",myDate);
					res.cookie("FSID", reslt.UserId,{expires:myDate, domain:'.bharatmatrimony.com', path:'/'});
					res.cookie("FSNAME", reslt.Name,{expires:myDate, domain:'.bharatmatrimony.com', path:'/'});					
					res.send({Resp:1,ErrCode:0,Id:reslt.UserId,Name:reslt.Name,loginst:1});
				} else {
					res.send({Resp:1,ErrCode:0,Id:"",Name:"",loginst:0});
				}
			} else{
				res.send({Resp:0,ErrCode:1});
				//res.render('login.ejs');
			}
		});	
	});

	app.get('/home', function(req, res){
		if(req.cookies.FSID && req.cookies.FSNAME){
			res.render('home.ejs',{Id:req.cookies.FSID,EmailId:req.cookies.FSNAME,Name:req.cookies.FSNAME});
		} else{
			res.render('login.ejs');
		}		
	});

	app.get('/register', function(req, res){
		var data = (!bmgeneric.empty(req.body)) ? req.body : req.query;	
		console.error("video====start=====",data);
		var mongobj = new mongoDB();
		mongobj.getUserCnt({},function(err,cnt){	
			var userId = bmgeneric.empty(parseInt(cnt)) ? 1 : parseInt(cnt); 
			console.log(cnt,"userId=========="+userId);	
			var insertval = {UserId:userId,Password:bmgeneric.encrypt(data.passwordsignup),Name:data.usernamesignup,Email:data.emailsignup,Status:1};		
			mongobj.setUser(insertval,function(err,inReslt){
				res.redirect('https://stgmc.bharatmatrimony.com:8080');
				//res.send({resp:1,errcode:0,UserId:userId});
			});	
		});	
	});

	app.post('/getUsers', function(req,res){
		console.log("getUsers err===================");
		var mongobj = new mongoDB();
		var whereval = {Status:1};
		mongobj.getUsers(whereval,function(err,reslt){
			if(!err) {
				console.log("getUsers err===================",reslt);
				if(!bmgeneric.empty(reslt)){
					res.send({Resp:1,ErrCode:0,data:reslt});
				} else {
					res.send({Resp:1,ErrCode:0,data:''});
				}
			} else{
				res.send({Resp:0,ErrCode:1});
			}
		});	
	});
	
	app.get('/meet', function(req, res){
		var data = (!bmgeneric.empty(req.body)) ? req.body : req.query;	
		console.error("meet====start=====",data);
		if(req.cookies.FSID && req.cookies.FSNAME){
			var mId = bmgeneric.empty(data.meetId) ? "" : data.meetId;
			res.render('meet.ejs',{Id:req.cookies.FSID,EmailId:req.cookies.FSNAME,Name:req.cookies.FSNAME,MId:mId});
		} else{
			res.render('login.ejs');
		}	
	});
	
	app.get('/video', function(req, res){
		var data = (!bmgeneric.empty(req.body)) ? req.body : req.query;	
		console.error("video====start=====",data);
		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");
		var uId = data.uid;
		var pId = data.rid;
		var rtcId = data.rtcid;	
		if(!data.rimg){
			var imagesrc = "add-photo-Ntxt-m-150-avatar.jpg";
			if(data.gender=='M'){
				imagesrc = "add-photo-Ntxt-f-150-avatar.jpg";
			}
			var sImg = "https://imgs.bharatmatrimony.com/mobile-assets/images/"+imagesrc+"";
		} else{
			var sImg = data.rimg;
		}
		res.render('video.ejs',{rtcId:rtcId,uid:uId,rid:pId,rImg:sImg,rName:data.rName,gender:data.gender,callInt:data.callInt});
	
	});


	RTCMultiConnectionServer.beforeHttpListen(httpApp, config);
	httpApp = httpApp.listen(process.env.PORT || PORT, process.env.IP || "0.0.0.0", function() {
		RTCMultiConnectionServer.afterHttpListen(httpApp, config);
	});

	// --------------------------
	// socket.io codes goes below

	ioServer(httpApp).on('connection', function(socket) {
		RTCMultiConnectionServer.addSocket(socket, config);

		// ----------------------
		// below code is optional
		const params = socket.handshake.query;
		console.log("params-----------",params);
		if (!params.socketCustomEvent) {
			params.socketCustomEvent = 'custom-message';
		}

		socket.on(params.socketCustomEvent, function(message) {
			socket.broadcast.emit(params.socketCustomEvent, message);
		});
	});