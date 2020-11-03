const express=require("express");
const router=express.Router();
const Campground=require("../models/campgrounds");
const Review=require("../models/review");
const middleware=require("../middleware");
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapboxToken});


const multer = require('multer');
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function (req, file, cb) {
   
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})
//
const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dvtlx8b6h', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get("/",function(req,res){
	
	Campground.find({},function(err,campgrounds){
		if(err){
			console.log(err);
		}else{
			res.render("campgrounds/index", {campgrounds:campgrounds, currentUser:req.user})
		}
	})
	
	
})


router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
})

router.post("/", middleware.isLoggedIn, upload.single('image'),async function(req,res){
	const geoData=await geocoder.forwardGeocode({
		query:req.body.campground.location,
		limit:1
	}).send();
	// console.log(geoData.body.features[0].geometry.coordinates);
	// console.log(geoData.body.features);
		   //get data from form and add to campgrounds page
	req.body.campground.geometry=geoData.body.features[0].geometry;
	cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
		if(err){
			req.flash('error', err.message);
			return res.redirect("back");
		}
		  
		  req.body.campground.image = result.secure_url;
		
		  req.body.campground.imageId=result.public_id;
		  // add author to campground
		  req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		  }
		
		Campground.create(req.body.campground, function(err,newlyCreated){
			if(err){
				req.flash('error', err.message);
				return res.redirect("back");
			}else{
				
				req.flash("success","Added a new campground!")
				res.redirect("/campgrounds");
			}
		})
	})
	
})


router.get("/:id", function(req, res){
	
	Campground.findById(req.params.id).populate("comments").exec(async function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Couldn't find the campground you are looking for");
			res.redirect("back");
		}else{
			await foundCampground.populate('review').execPopulate();
			
			res.render("campgrounds/show", {campground:foundCampground});
		}
	})
	
})

//Edit Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	
		Campground.findById(req.params.id, function(err, foundCampground){
			
					res.render("campgrounds/edit",{campground:foundCampground});
		})
				

})



router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
	Campground.findById(req.params.id, async function(err, campground){
		const geoData=await geocoder.forwardGeocode({
			query:req.body.campground.location,
			limit:1
		}).send();
		if(err){
			req.flash('error', err.message);
			res.redirect("/campgrounds")
		}else{
			if(req.file){
				try{
					await cloudinary.v2.uploader.destroy(campground.imageId);
					
					var result=await cloudinary.v2.uploader.upload(req.file.path);//upload new image
					campground.imageId=result.public_id;
					campground.image=result.secure_url;
					
				}
				catch(err){
					req.flash('error', err.message);
					return res.redirect("/campgrounds");
					
				}
					
				
			}
			campground.name=req.body.campground.name;
			campground.description=req.body.campground.description;
			campground.location=req.body.campground.location;
			campground.price=req.body.campground.price;
			campground.geometry=geoData.body.features[0].geometry;
			campground.save();
			req.flash("success", "Successfully updated!");
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, async function(err, campground){
		if(err){
			req.flash('error', err.message);
			return res.redirect("back")
			
		}
		try{
			await cloudinary.v2.uploader.destroy(campground.imageId);
			campground.remove();
			req.flash("success", "Successfully deleted the campground")
			res.redirect("/campgrounds")
		}
		catch(err){
			req.flash('error', err.message);
			return res.redirect("back")
		}
	})
	
})


router.post("/:id/reviews", middleware.isLoggedIn, async function(req,res){
	const campground=await Campground.findById(req.params.id);
	const review=new Review(req.body.review);
	review.author=req.user._id;
	review.author = {
			id: req.user._id,
			username: req.user.username
		  }
	campground.review.push(review);
	await review.save();
	await campground.save();
	req.flash("success", "Created a new Review!");
	res.redirect(`/campgrounds/${campground._id}`)
})
router.delete("/:id/reviews/:reviewId", middleware.isLoggedIn, middleware.checkReviewOwnership, async function(req, res){
	const {id, reviewId}=req.params;
	Campground.findByIdAndUpdate(id, {$pull:{review:reviewId}});
	await Review.findByIdAndDelete(reviewId);
	req.flash("success", "Deleted the review successfully")
	res.redirect(`/campgrounds/${id}`);
})



module.exports=router;
