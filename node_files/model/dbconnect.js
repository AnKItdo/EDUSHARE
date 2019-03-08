var mongodb = require('mongodb');
module.exports.createDBConection = function(callback){
	
	mongodb.connect('mongodb://localhost:27017/mydb',function(err,db){
		if(err){
			console.error("fail to connect db "+err);
		}else{
			console.log("connected");
			callback.call(this,err,db);
		}
	});
}