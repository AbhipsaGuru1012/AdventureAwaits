require('dotenv').config();

const express=require("express"),
	app=express(),
	bodyParser=require("body-parser"),
	mongoose=require("mongoose"),
	passport=require("passport"),
	flash=require("connect-flash"),
	session=require("express-session"),
	MongoStore=require("connect-mongo")(session),
	LocalStrategy=require("passport-local"),
	methodOverride=require("method-override"),
	helmet=require("helmet"),
	Campground=require("./models/campgrounds"),
	Comment=require("./models/comments"),
	Review=require("./models/review"),
	User=require("./models/user"),
	seedDB=require("./seeds");
	dbUrl=process.env.DB_URL;

const mongoSanitize=require("express-mongo-sanitize");

const commentRoutes=require("./routes/comments"),
	campgroundRoutes=require("./routes/campgrounds"),
	authRoutes=require("./routes/index")


// mongoose.connect("mongodb://localhost/yelp_camp", { //creates new db called yelp_camp
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })

// const MongoClient = require('mongodb').MongoClient;
 mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	 useCreateIndex: true,
   useUnifiedTopology: true,
	 useFindAndModify: false
});
// const client = new MongoClient(uri, { useNewUrlParser: true,  useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

const db=mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database connected!");
})


app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));//conventional way of adding directory name
app.use(methodOverride("_method"));// _method is conventional way
app.use(mongoSanitize());

const secret=process.env.SECRET || 'thisshouldbeabettersecret!';

const store=new MongoStore({
	url:dbUrl,
	secret,
	touchAfter:24*60*60
});

store.on("error", function(e){
	console.log("Session store error!", e);
})


const sessionConfig={
	store,
	name:'session',
	secret,
	resave:false,
	saveUninitialized:true,
	cookie:{
		// secure:true,
		httpOnly:true,
		expires:Date.now()+1000*60*60*24*7,
		maxAge:1000*60*60*24*7
	}
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy:false}));

//seedDB();//seed the db
//Passport configuration
app.use(require("express-session")({
	secret:"You should not ne naming you-know-who",
	resave:false,
	saveUninitialized:false
}))

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
	"https://code.jquery.com/",
	"https://api.mapbox.com/mapbox-gl-js/",
	
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
	"https://api.mapbox.com/mapbox-gl-js",
	"https://fontawesome.com"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
	"https://ka-f.fontawesome.com/"
];
const fontSrcUrls = [
	"https://ka-f.fontawesome.com/"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvtlx8b6h/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
				"https://i.imgur.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))//User.authenticate comes with passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Campground.create({
//	name:"Rishikesh Valley Camp", 
//	image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTPo69DcEF_1kgxZ3DGHrV0coYooQ_rI2DXYg&usqp=CAU",
//	description:"This camground lies on the outskirts of Rishikesh. Beautiful Place."
//},function(err,campground){
//	if(err){
//		console.log("Error!");
//	}else{
//		console.log("Campground created");
//		console.log(campground);
//	}
//})


app.use(function(req, res, next){
	res.locals.currentUser=req.user;//passes it to all templates
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
})


app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds", campgroundRoutes);//adds /campgrounds to all campgrounds routes
app.use(authRoutes)

app.listen(3000,() => {
	console.log("Server listening in port 3000");
})