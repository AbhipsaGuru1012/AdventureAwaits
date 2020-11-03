const express=require("express");
const router=express.Router({mergeParams:true});
const Campground=require("../models/campgrounds");
const Comment=require("../models/comments");
const middleware=require("../middleware");
//COMMENTS ROUTE-Nested Routes
router.get("/new",middleware.isLoggedIn,function(req,res){
	
	Campground.findById(req.params.id, function(err,campground){
		if(err){
			req.flash("error", "Something went wrong!")
			console.log(err)
		}else{
			res.render("comments/new",{campground:campground})
		}
		
	})
	
})
router.post("/",middleware.isLoggedIn, function(req, res){
	
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			req.flash("error", "Something went wrong!")
			console.log(err)
			res.redirect("/campgrounds")
		}else{
			
			Comment.create(req.body.comment,function(err, comment){
				if(err){
					req.flash("error", "Something went wrong!")
					console.log(err)
					
				}else{
					
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					
					comment.save();
					campground.comments.push(comment);
					campground.save();
					console.log(comment);
					req.flash("Successfully added comment");
					res.redirect("/campgrounds/"+campground._id);
				}
			})
		}
	})
	
})


router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found!");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back");
			}else{
				res.render("comments/edit", {campground_id:req.params.id, comment:foundComment});
			}

		})
	})
	
	
})

router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})


router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			req.flash("error", "Something went wrong")
			res.redirect("back");
		}else{
			req.flash("success", "Deleted comment successfully!")
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})


module.exports=router;
