/**********************************************************************************************
 *	Filename	: httpconfig.js							
 *	Author		: Sathrak paldurai K
 *	Date		: 26-07-2018								
 *	Description	: Chat Server.
***********************************************************************************************/	
var httpconfig = {
    username : 'node123',
    password : 'node123',
    prefTransport		: ['websocket','xhr-polling,'], //websocket, htmlfile,  jsonp-polling
    pollingDuration		: 10,			   //seconds
    heartbeatTimeout	: 180,
    heartbeatInterval	: 25,
    ChatPort			: 3000,
    origins				: '*:*',
    logLevel: 0 //0 - error, 1 - warn, 2 - info, 3 - debug
};
    
module.exports = httpconfig;

	