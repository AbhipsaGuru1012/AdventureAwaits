const mongoose=require("mongoose")


const opts={toJSON: {virtuals:true}};



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
			ref:"Review"
		}
	],
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
		
		},
		username:String
	},
	comments:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"Comment"
		}
	]
},opts)



campgroundSchema.virtual('properties.popUpMarkup').get(function(){
	return `<strong><a href="/campgrounds/${this._id}">${this.name}</a></strong>`
})
campgroundSchema.post('findOneAndDelete', async function (doc){
		if(doc){
			await Review.deleteMany({
				_id:{
					$in:doc.review
				}
			})
		}
})

module.exports=mongoose.model("Campground",campgroundSchema);
