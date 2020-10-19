/******************************************************************************************************
| File Name			: mcmemcacheclass.js
| Author Name		: Sathrak Paldurai k
| Created On		: 24 Aug, 2017
| Description		: MemCache Class
******************************************************************************************************/
	var Memcached   = require('memcached');
	var async 		= require('async'); // async@2.3.0
	//Live Server IP
	var bm_node_servers = {0:"192.168.30.143:1234",1:"192.168.30.143:1234",2:"192.168.30.143:1234",3:"192.168.30.143:1234",4:"192.168.30.143:1234",5:"192.168.30.143:1234",6:"192.168.30.143:1234",7:"192.168.30.143:1234",8:"192.168.30.143:1234",9:"192.168.30.143:1234"};
			
	/**********************MEMCACHE GLOBAL SETTINGS start ********************/
	var MemOption = {poolSize:15,minTimeout:1000,reconnect:10,remove:true};
	let memNodeServers = [];
	async.eachOfSeries(bm_node_servers,function(memcacheip, memindex, next){
		console.log("Memcache node Connected :",memcacheip,memindex);
		memNodeServers[memindex] = new Memcached(memcacheip,MemOption);
		
		//Memcahed Servers failure event listening
		memNodeServers[memindex].on('issue', function(details) {
			console.error("Server " + details.server + " has issue : " + details.messages.join(''));
		});

		memNodeServers[memindex].on('failure', function(details) {
			console.error("Server " + details.server + " went down due to: " + details.messages.join(''));
		});

		memNodeServers[memindex].on('reconnecting', function(details) {
			console.error("Total downtime caused by server " + details.server + " :" + details.totalDownTime + "ms");
		});
		
		next(null);
	},function(err){
		if(err){
			console.log("Error");
		} 
	});	
	
	/*This function use for mod logic and get server ip*/
	function getServerId(x_id,no_of_servers) {
		var y_id = x_id.substring(1, x_id.length);	
		var matriid_tot = 0;
		for (i = 0; i <= y_id.length - 1; i++) {
			matriid_tot += parseInt(y_id.substr(i, 1));
		}
		return (matriid_tot) % (no_of_servers);
	}
	
	Cache = {	
		/**
		 * Returns the value stored in the memory by it's key
		 *
		 * @param string $key
		 * @return mix
		*/		
		get : function(serverid,key,next){
			var no_of_servers = bmgeneric.count(bm_node_servers);		
			var indexkey = getServerId(serverid,no_of_servers);		
			memNodeServers[indexkey].get(key, function(err, val_frm_mem)
			{
				if(err){
					console.error("Memcace getNode func - key:"+ key +":Error at: "+err.stack );
					return next(err,{});
				}else{		
					return next(null,val_frm_mem);
				}	
			});
		},		
		/**
		 * Store the value in the memcache memory (overwrite if key exists)
		 *
		 * @param string $key
		 * @param mix $var
		 * @param bool $compress
		 * @param int $expire (seconds before item expires)
		 * @return bool
		*/		
		set : function(serverid,key,val,expire=0) {
			//Store the same $key-$value in the backup server
			if(bmgeneric.trim(expire)=='' || expire==0)
				var expire = 86400; //by default set the expiry time to 24 hrs.
			var no_of_servers = bmgeneric.count(bm_node_servers);
			var indexkey = getServerId(serverid,no_of_servers);			
			memNodeServers[indexkey].set(key,val,expire, function (err, result) 
			{
				if(err)
					console.log("Memcace set 0 func - key:"+ key +"Error at: "+err.stack );
			});			
			return true;
		}, 		
		/**
		 * Set the value in memcache if the value does not exist; returns FALSE if value exists
		 *
		 * @param sting $key
		 * @param mix $var
		 * @param bool $compress
		 * @param int $expire
		 * @return bool
		*/		
		add : function(serverid,key,val,expire=0) {			
			var no_of_servers = bmgeneric.count(bm_node_servers);
			var indexkey = getServerId(serverid,no_of_servers);
			//Store the same $key-$value in the backup server
			if(bmgeneric.trim(expire)=='' || expire==0)
				var expire = 86400; //by default set the expiry time to 24 hrs.		
			memNodeServers[indexkey].add(key,val,expire, function (err) 
			{		
				if(err)
					console.log("Memcace add func - key:"+ key +"Error at: "+err.stack );
			});
			return true;
		},
		append : function(serverid,key,val) {			
			var no_of_servers = bmgeneric.count(bm_node_servers);
			var indexkey = getServerId(serverid,no_of_servers);
			//Store the same $key-$value in the backup server
			memNodeServers[indexkey].append(key,val, function (err) 
			{		
				if(err)
					console.log("Memcace add func - key:"+ key +"Error at: "+err.stack );
			});
			return true;
		},
		preprend : function(serverid,key,val) {			
			var no_of_servers = bmgeneric.count(bm_node_servers);
			var indexkey = getServerId(serverid,no_of_servers);
			//Store the same $key-$value in the backup server	
			memNodeServers[indexkey].preprend(key,val, function (err) 
			{		
				if(err)
					console.log("Memcace add func - key:"+ key +"Error at: "+err.stack );
			});
			return true;
		},
		/**
		 * Replace an existing value
		 *
		 * @param string $key
		 * @param mix $var
		 * @param bool $compress
		 * @param int $expire
		 * @return bool
		*/
		replace : function(serverid, key, val, expire=0) {			
			var no_of_servers = bmgeneric.count(bm_node_servers);
			var indexkey = getServerId(serverid,no_of_servers);
			//Store the same $key-$value in the backup server
			if(bmgeneric.trim(expire)=='' || expire==0)
				var expire = 86400; //by default set the expiry time to 24 hrs.		
			memNodeServers[indexkey].replace(key,val,expire, function (err) 
			{		
				if(err)
					console.log("Memcace replace func - key:"+ key +"Error at: "+err.stack );
			});
			return true;
		},
		/**
		 * Delete a record or set a timeout
		 *
		 * @param string $key
		 * @param int $timeout
		 * @return bool
		*/
		deleted : function(serverid,key) {
			var no_of_servers = bmgeneric.count(bm_node_servers);
			var indexkey = getServerId(serverid,no_of_servers);		
			memNodeServers[indexkey].del(key, function (err) 
			{		
				if(err)
					console.log("Memcace deleted func - key:"+ key +"Error at: "+err.stack );
			});
			return true;
		},
		/**
		 * Increment an existing integer value
		 *
		 * @param string $key
		 * @param mix $value
		 * @return bool
		*/
		increment : function(key, value=1) {
			var no_of_servers = bmgeneric.count(bm_node_servers);
			var indexkey = getServerId(key,no_of_servers);			
			memNodeServers[indexkey].incr(key, value, function (err) 
			{		
				if(err)
					console.log("Memcace increment func - key:"+ key +"Error at: "+err.stack );
			});
			return true;
		},
		/**
		 * Decrement an existing value
		 *
		 * @param string $key
		 * @param mix $value
		 * @return bool
		*/
		decrement : function(key, value=1) {
			var no_of_servers = bmgeneric.count(bm_node_servers);
			var indexkey = getServerId(key,no_of_servers);		
			memNodeServers[indexkey].decr(key, value, function (err) 
			{		
				if(err)
					console.log("Memcace decrement func - key:"+ key +"Error at: "+err.stack );
			});
			return true;
		}
	};
	
	exports.getServerId = getServerId;
	exports.Cache = Cache;