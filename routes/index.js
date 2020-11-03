const express=require("express");
const router=express.Router();
const passport=require("passport");

const User=require("../models/user")
router.get("/",function(req,res){
	
	res.render("landing");
})
//Auth Routes
//show register form
router.get("/register", function(req, res){
	res.render("register");
})
//handle sign-up logic
router.post("/register",function(req,res){
	const newUser=new User({username:req.body.username});//newUser has only the username assigned
	User.register(newUser, req.body.password, function(err, user){//user is the newUser that was made
		if(err){
			console.log(err);
			//whatever error message we get in the error ie err here
			return res.render("register", {"error": err.message});
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to Wilderness Experience "+user.username)
			res.redirect("/campgrounds");
		})
	})
})
//login form
router.get("/login", function(req, res){
	res.render("login");
})
//login logic
router.post("/login", passport.authenticate("local",
	{
		successRedirect:"/campgrounds",
		failureRedirect:"/login"
	}), function(req, res){
})
//logout route
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "Logged you out successfully!")
	res.redirect("/campgrounds")
})


module.exports=router;