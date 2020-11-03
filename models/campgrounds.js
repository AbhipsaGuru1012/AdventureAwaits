const mongoose=require("mongoose")

//Schema setup
const opts={toJSON: {virtuals:true}};//see use of this



const campgroundSchema=new mongoose.Schema({
	name:String,
	price:String,
	image:String,
	imageId:String,
	geometry:{
		type:{
			type:String,
			enum:['Point'],
			required:true
		},
		coordinates:{
			type:[Number],
			required:true
		}
	},
	description:String,
	location:String,
	review:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"Review"//review model
		}
	],
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
		
		},
		username:String
	},
	comments:[//data association
		{
			type:mongoose.Schema.Types.ObjectId,//refrence type association
			ref:"Comment"
		}
	]
},opts)

// campgroundSchema.virtual('thumbnail').get(function(){
// 	return this.image.replace('/upload', '/upload/w_200')
// })//this is not working, in the image edit in edit form

campgroundSchema.virtual('properties.popUpMarkup').get(function(){//see the use of this statement and virtual//to populate properties field in map
	return `<strong><a href="/campgrounds/${this._id}">${this.name}</a></strong>`//the particular campground instance is this
})
campgroundSchema.post('findOneAndDelete', async function (doc){//mongoose middleware to delete reviews from database after a particular campground was deleted
		if(doc){
			await Review.deleteMany({
				_id:{
					$in:doc.review//delete all reviews in the id of campground that was deleted
				}
			})
		}
})

module.exports=mongoose.model("Campground",campgroundSchema);//compiling schema into a model