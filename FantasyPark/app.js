const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const path = require("path");
const Twit = require('twit')
const request = require('request');
const rp = require("request-promise");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const passportLocalMongoose=require("passport-local-mongoose");
let type;
let icon;
let temp;

//connect to database 
mongoose.connect('mongodb://localhost/tickets');

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'/public')));
//Templating engine 
app.set("view engine", "ejs");


//Schema for collection and database setup

const ticketSchema = new mongoose.Schema({
    name:String,
    price:Number,
    image:String,
    description: String
});

const Ticket = mongoose.model("Ticket", ticketSchema);

// Attractions Schema 

const attractionSchema = new mongoose.Schema({
   name:String,
   intensity:String,
   height:Number,
   image:String,
   video:String
});

const Attraction = mongoose.model("Attraction", attractionSchema);

// Users Schema 

const UserSchema= new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);
const User=mongoose.model("User",UserSchema);

// Express-session middleware 
app.use(require("express-session")({
    secret:"Once again Rusty wis cutest dog!",
    resave:false,
    saveUninitialized: false
}));

// Authentication using passport.js
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Server's middleware 
app.use(function(req,res,next){
    request('http://api.apixu.com/v1/current.json?key=c03b1605464b469f936161313180904&q=toledo', (error, response, body) => {
        temp = (JSON.parse(body).current.temp_f);
        type = (JSON.parse(body).current.condition.text);
        icon = (JSON.parse(body).current.condition.icon);
        
    });
    res.locals.name = temp;
    res.locals.name2 = type;
    res.locals.name3 = icon;
    res.locals.currentUser=req.user;
    next();
 });

// Server's routes start here 
// home route
app.get('/', (req, res) => {
    res.render('home');
});

//Register page
app.get("/register", (req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    User.register(new User({username:req.body.name}),req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            res.render("register");
        } else{
            req.login(user,(err)=>{
                if(err){
                    console.log(err);
                }else{
                res.render("home");
                }
            });
        }
    });
});

app.get("/invalidlogin",(req,res)=>{
    res.send("invalidlogin");
});

// login route 
app.get("/login",(req, res)=> {  
    res.render("login");
});

app.post("/login",passport.authenticate("local",{ 
    successRedirect:"/",
    failureRedirect:"/invalid login",
}));

//logout
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

// tickets page 
app.get('/tickets', (req, res) => {
    
     Ticket.find({},(err, tickets) => {
        if(err) {
            console.log(err);
        } else {
           // console.log(tickets)
           
           res.render("tickets", {tickets:tickets});
        }
    });
})

// attractions page 
app.get('/attractions', (req, res) => {
    Attraction.find({}, (err,attractions) => {
       if(err) {
           console.log(err);
       } else {
           res.render('attractions',{rides:attractions});
       }
    });
})

app.get('/attractions/:id', (req, res) => {
    Attraction.findById(req.params.id,(err, foundAttraction) => {
        if(err){
            console.log(err);
        } else {
            res.render('show', {ride:foundAttraction});
        }
    });
})


app.get('/new', (req, res) => {
    res.render("new");
});


app.listen(process.env.PORT || 3000,(err) => {
    if(err) {
        throw err;
    } else {
        console.log('Fanrasy Parks Server is up and running on 3000');
    }
})
