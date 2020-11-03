const Campground=require("../models/campgrounds");
const Comment=require("../models/comments");
const Review=require("../models/review");

//all middleware goes here
const middlewareObj={};

middlewareObj.checkCampgroundOwnership=function(req, res, next){
	//is user logged in
	if(req.isAuthenticated()){//to see if logged in
		
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err  || !foundCampground){
				req.flash("error", "Couldn't find the Campground you are looking for")
				res.redirect("back");
			}else{
				//does the user own the campground
				if(foundCampground.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You don't have permission to do that")
					res.redirect("back");
				}
				
			}
			

		})
	
	}else{
		req.flash("error", "You need to be logged in to do that")
		res.redirect("back");
	}
	
}
middlewareObj.checkCommentOwnership=function(req, res, next){
	
	if(req.isAuthenticated()){
		
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found!")
				res.redirect("back");
			}else{
				
				if(foundComment.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You don't have permission to do that")
					res.redirect("back");
				}
				
			}
			

		})
	
	}else{
		req.flash("error", "You need to be logged in")
		res.redirect("back");
	}
}
middlewareObj.checkReviewOwnership=function(req, res, next){
	
	if(req.isAuthenticated()){
		
		Review.findById(req.params.reviewId, function(err, foundReview){
			console.log(foundReview)
			if(err || !foundReview){
				console.log(err);
				req.flash("error", "Review not found!")
				res.redirect("back");
			}else{
				
				if(foundReview.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You don't have permission to do that")
					res.redirect("back");
				}
				
			}
			

		})
	
	}else{
		req.flash("error", "You need to be logged in")
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn=function(req, res, next){
	
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to login first");
	res.redirect("/login")

}

module.exports=middlewareObj;
