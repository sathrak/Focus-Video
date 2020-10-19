/*****************************************************************************************************
* 	Filename	: mongotableschema.js	
*	Author		: Sathrak Paldurai K
*	Date		: 19-03-2016								
*	Description	: File having information about Chat Table schemea for Mongoose Modules.  
******************************************************************************************************/
exports.getSchema = (mongooseObj,mongodbconn,tablename)=>{
	var Schema = mongooseObj.Schema;	
	var ObjectId = Schema.ObjectId;
	var tableSchema = '';
	switch (tablename){		
		case "userstatus1":
		tableSchema = new Schema({
			_id: String,			
			UserId:String,
			Name:String,
			Password:String,			
			Gender:String,
			City:String,
			Country:String,
			Email:String,
			MobileNo:String,
			OnlineStatus:Number,
			ThumbImg: String,
			LastLogin: Number,
			AppType:String,		
			UserType:Number,
			Status:Number
		},{ collection: tablename});
		break;
		case "messagedet1":
		tableSchema = new Schema({
			_id : ObjectId,				
			uId : String,
			pId : String,
			sId : String,
			msg : String,
			uTime : Number,
			pTime : Number,
			msgTime : Number,
			rStatus : Number,
			dStatus : Number
		},{ collection: tablename});
		break;
	}		
	return mongodbconn.model(tablename,tableSchema);
}
