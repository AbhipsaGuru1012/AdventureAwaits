const mongoose=require("mongoose"),
	Campground=require("./models/campgrounds"),
	Comment=require("./models/comments")


const data=[
	{
		name:"Camp Exotica",
		image:"https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description:"Amazing view and weather. Get a chance to dwell in the clouds!"
	},
	{
		name:"Rishikesh Valley Camp",
		image:"https://images.unsplash.com/photo-1526491109672-74740652b963?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description:"Located besides the river, get a chance to experience how it fells to spend time with nature!"
	},
	{
		name:"Tso Moriri Lake",
		image:"https://images.unsplash.com/photo-1503265192943-9d7eea6fc77a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description:"This camp is in Ladakh. So you can get live along side the mountains!"
	},
	
]

function seedDB(){
	//Remove all campgrounds
	Campground.remove({},function(err){
	// 	if(err){
	// 		console.log(err)
	// 	}else{
	// 		console.log("Removed Campgrounds!")
	// 		//add a few campgrounds
	// 		//loop through data that has campgrounds
	// 		data.forEach(function(seed){//placing this outside remove may execute it first and then remove. So placed inside remove
	// 			Campground.create(seed, function(err, campground){
	// 				if(err){
	// 					console.log(err)
	// 				}else{
	// 					console.log("added a campground!");
	// 					//add a comment
	// 					Comment.create({
	// 						text:"This is a great place but internet issues are there :(",
	// 						author:"Abhipsa"
	// 					}, function(err,comment){
	// 						if(err){
	// 							console.log(err)
	// 						}else{
	// 							campground.comments.push(comment);
	// 							campground.save();
	// 							console.log("created new comment")
	// 						}
							
	// 					})
	// 				}
	// 			})
	// 		})
	// 	}
	 })
	
}
module.exports=seedDB;
