const express=require("express");
const router=express.Router();
const Campground=require("../models/campgrounds");
const Review=require("../models/review");
const middleware=require("../middleware");
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapboxToken});

//multer congiguration for image upload
const multer = require('multer');
const storage = multer.diskStorage({//the image being uploaded is stored in a var name
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);//the date and file name
  }
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {//must have extensions in the image file
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})
//
const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dvtlx8b6h', 
  api_key: process.env.CLOUDINARY_API_KEY, //store it in .env file and hide from others, don't upload env files in github
  api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get("/",function(req,res){
	//Get all camgrounds from DB
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

router.post("/", middleware.isLoggedIn, upload.single('image'),async function(req,res){//image is coming from the 'new' form and here the upload is a middleware
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
		  // add cloudinary url for the image to the campground object under image property
		  req.body.campground.image = result.secure_url;//adding image field to campground
		//add images's public id to campground object
		  req.body.campground.imageId=result.public_id;
		  // add author to campground
		  req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		  }
		

		// var name=req.body.name;
		// var price=req.body.price;
		// var image=req.body.image;
		// var desc=req.body.description
		// var author={
		// 	id:req.user._id,
		// 	username:req.user.username
		// }
		// var newCampground={name:name, price:price,image:image, description:desc, author:author}



		// console.log(req.user);
		//create a new campground and save to DB
		Campground.create(req.body.campground, function(err,newlyCreated){
			if(err){
				req.flash('error', err.message);
				return res.redirect("back");
			}else{
				// console.log(newlyCreated)
				req.flash("success","Added a new campground!")
				res.redirect("/campgrounds");
			}
		})
	})
	
})

//Shows more info about one campground
router.get("/:id", function(req, res){
	//FIND THE CAMPGROUND WITH THE PARTICULAR ID
	Campground.findById(req.params.id).populate("comments").exec(async function(err, foundCampground){//populating the comments array on it so that it's not just an id
		if(err || !foundCampground){
			req.flash("error", "Couldn't find the campground you are looking for");
			res.redirect("back");
		}else{
			await foundCampground.populate('review').execPopulate();//need to call execPopulate to actually populate it
			// console.log(foundCampground);
			//render the show template for that campground
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


//Update Route
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
	Campground.findById(req.params.id, async function(err, campground){//earlier it was just findByIdAndUpdate with middle parameter as req.body.campground and err and the simple else part/async bec the image upload can take longer and other statements get executed first
		const geoData=await geocoder.forwardGeocode({
			query:req.body.campground.location,
			limit:1
		}).send();
		if(err){
			req.flash('error', err.message);
			res.redirect("/campgrounds")
		}else{
			if(req.file){//if an image is uploaded/changed
				try{
					await cloudinary.v2.uploader.destroy(campground.imageId);//destroy prev image//await means wait till the line gets executed
					
					var result=await cloudinary.v2.uploader.upload(req.file.path);//upload new image
					campground.imageId=result.public_id;
					campground.image=result.secure_url;
					// campground.image.push(result);//not overwriting prev images but pushing them
				}
				catch(err){//catch the error
					req.flash('error', err.message);
					return res.redirect("/campgrounds")//return means exit from the whole block
					
				}
					
				
			}
			campground.name=req.body.campground.name;
			campground.description=req.body.campground.description;
			campground.location=req.body.campground.location;
			campground.price=req.body.campground.price;
			campground.geometry=geoData.body.features[0].geometry;
			campground.save();//updated and now save in db
			req.flash("success", "Successfully updated!");
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})
//delete campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, async function(err, campground){//earlier it was simply findByIdAndRemove
		if(err){
			req.flash('error', err.message);
			return res.redirect("back")
			
		}
		try{
			await cloudinary.v2.uploader.destroy(campground.imageId);//destroy prev image//await means wait till the line gets executed
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

//Adding review routes
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
	res.redirect(`/campgrounds/${campground._id}`)//adding `` is string template literal technique
})
router.delete("/:id/reviews/:reviewId", middleware.isLoggedIn, middleware.checkReviewOwnership, async function(req, res){
	const {id, reviewId}=req.params;
	Campground.findByIdAndUpdate(id, {$pull:{review:reviewId}});//pull is a mongoose method where we are pulling out the reviewId out of reviews(check)
	await Review.findByIdAndDelete(reviewId);
	req.flash("success", "Deleted the review successfully")
	res.redirect(`/campgrounds/${id}`);
})



module.exports=router;