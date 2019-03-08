var express = require('express');
var router = express.Router();
var db = require('../model/dbconnect.js');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const homeStartingContent = "New Releases..."
const recentlyvisited = "Recently visited.."
const recommended = "Recomemded for you.."
const aboutContent = "we offer the platform to share and gain knowledge....";
const contactContent = "Emai me : dankit264@gmail.com";
mongoose.connect('mongodb://localhost:27017/bloogDB', {useNewUrlParser: true});

//posts schema
const postSchema = new mongoose.Schema ({
  title: String,
  content: String
});

const Post = mongoose.model("Post", postSchema);

router.get("/compose",function(req,res){
res.render("compose");
});

router.post("/compose", function(req, res){
	const post = new Post({
		title: req.body.postTitle,
		content: req.body.postBody
	});


	post.save(function(err){
		if (!err){
				res.redirect("/home");
		}
	});
});


router.get('/',function(req,res){
	res.render('index');
});
router.get('/signin',function(req,res){
	res.render('signin');
});
router.get('/post',function(req,res){
	res.render('post');
});

router.get('/contact',function(req,res){
res.render("contact",{contactContent:contactContent});
});


router.get('/profile',function(req,res){
	res.render('profile');
});



router.get("/home", function(req, res){

	Post.find({}, function(err, posts){
		res.render("home", {
			StartingContent: homeStartingContent,
			posts: posts
			});
	});
});




router.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});






//-------------------------------------------------------------------------------
router.get('/signup',function(req,res){
	res.render('signup');
});
router.get('/forgot',function(req,res){
	res.render('forgotPassword');
});
router.get('/about',function(req,res){
	res.render("about",{aboutContent:aboutContent});
});





router.post('/reset',function(req,res){
	var emailId =   req.body.email;
	var token = crypto.randomBytes(64).toString('hex');
	db.createDBConection(function(err,database){
		if (err){
			throw err;
			return res.redirect('error');
		}
		//console.log("connected to database successfully");
		database.collection("users").update({"email":emailId},{$set:{"resetPasswordToken":token}},function(err,result){
			sendMail(token,emailId);
		});
	})
	function sendMail(){
		console.log('mail sent to given address');
		var smtpTransport = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'yourgmail@gmail.com',
				pass: 'yourpassword'
			}
		});


		var mailOptions = {
			from: "youremail@gmail.com",
			to: emailId,
			subject: "Node.js Password Reset",
			text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
			  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
			  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
			  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
				console.log(error);
			}else{
				console.log("Message sent: " + response.message);
				res.render('success');
			}

		});
	}
});
router.get('/reset/:token', function(req, res) {
	db.createDBConection(function(err,database){
		if (err){
			throw err;
			return res.redirect('forgot');
		}
		console.log("connected to database successfully");
		database.collection("users").find({"resetPasswordToken":req.params.token}).toArray(function(err,result){
			res.render('reset',{token:req.params.token});
		});
	});
});

// app.post('/reset/:token', function(req, res) {
// 	db.createDBConection(function(err,database){
// 		if (err){
// 			throw err;
// 			return res.redirect('forgot');
// 		}
// 		database.collection("users").update({"resetPasswordToken":req.params.token},{$set:{password : req.body.password,"resetPasswordToken" : undefined}},function(err,result){
// 			sendConfirmationMail();
// 		});
// 	});
// 	function sendConfirmationMail(){
// 		var smtpTransport = nodemailer.createTransport({
// 			service: 'gmail',
// 			auth: {
// 				user: 'youremail@gmail.com',
// 				pass: 'yourpassword'
// 			}
// 		});
//
//
// 		var mailOptions = {
// 			from: "youremail@gmail.com",
// 			to: emailId,
// 			subject: "Node.js Password Reset",
// 			text: 'Hello,\n\n' +
// 				'This is a to confirm that the password for your account has just been changed.\n'
// 		}
//
// 		// send mail with defined transport object
// 		smtpTransport.sendMail(mailOptions, function(error, response){
// 			if(error){
// 				console.log(error);
// 			}else{
// 				console.log("Message sent: " + response.message);
// 				res.render('success');
// 			}
//
// 		});
// 	}
//
// });
router.post('/login',function(req,res){
	var email= req.body.email;
	var password = req.body.password;
	db.createDBConection(function(err,database){
		if (err){
			throw err;
			return res.redirect('error');
		}
		console.log("connected to database successfully");
		 // return res.render('home');
		database.collection("users").find({"email":email}).toArray(function(err,result){
			if(result[0]){
				if(result[0].password == password){
				res.render('success');


				}
				res.render('error');

			}
		});
	})
});
router.post('/sign_up',function(req,res){
	var name = req.body.name;
	var email= req.body.email;
	var pass = req.body.password;


	var data = {
		"name":name,

		"email":email,
		"password": pass

	}
	db.createDBConection(function(err,database){
		if (err){
			throw err;
			res.render('error');
		}
		console.log("connected to database successfully");

		//CREATING A COLLECTION IN MONGODB USING NODE.JS
		database.collection("users").insertOne(data, (err , collection) => {
			if(err) throw err;
			console.log("Record inserted successfully");
			//console.log(collection);
			res.render('signin');
		});
	});

});
module.exports = router;
