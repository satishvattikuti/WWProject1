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

//Twitter

const Twitter = new Twit( {
  consumer_key: 'izFLOhFIKv8ufBKO9lqksgagM',
  consumer_secret: 'Q6MxE8Hnwroz4fx3hQbBwfASmh1dfVWR11sGPmXb8MtILAFqQl',
  access_token: '3688784633-eaiMlPQTgCmaNLJHV08kyd8FLyPNeKft3Ezd8rG',
  access_token_secret: 'GNXPBWjnTJ3ooHd2yUA9fMj8uRJN7mQjTPzFeCuVWhQri'
});


mongoose.connect('mongodb://localhost/tickets');

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'/public')));


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

const UserSchema= new mongoose.Schema({
    username: String,
    password: String
});
UserSchema.plugin(passportLocalMongoose);

const User=mongoose.model("User",UserSchema);

app.use(require("express-session")({
    secret:"Once again Rusty wis cutest dog!",
    resave:false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// Attraction.create({
//     name:"Thunder Bolt",
//     intensity:"Medium",
//     height:47,
//     image:"https://images.unsplash.com/photo-1471893110745-5c1b1f2dff57?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=0c7a9fb5de705b9a09ecd49f5d8ba6fb&auto=format&fit=crop&w=1950&q=80",
//     video:"https://ak5.picdn.net/shutterstock/videos/13726625/preview/stock-footage-riding-a-crazy-roller-coaster-at-the-front-seat-point-of-view-footage.mp4"
// },(err,saved) => {
//     if(err) {
//         console.log(err);
//     } else {
//         console.log("Success");
//     }
// })

//  Attraction.findByIdAndRemove("5ada35612fb2bc143bae02a7",(err) => {
//         if(err) {
//             console.log(err)
//         } else {
//             console.log("success");
//         }
//     })
let type;
let icon;
let temp;
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

app.set("view engine", "ejs");



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
//login
app.get("/login",(req, res)=> {
    
    res.render("login");

});

app.post("/login",passport.authenticate("local",{
    
    successRedirect:"/",
    failureRedirect:"/invalid login",
}),function(req,res){
    
    
}
);
//logout
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

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

// app.get('/forecast',(req, res) => {
//   rp('https://api.apixu.com/v1/forecast.json?key=c03b1605464b469f936161313180904&q=Paris')
//   .then((result) => {
//       console.log(JSON.parse(result));
//   })
//   .catch((err) => {
//       console.log(err);
//   })
// });

app.get('/new', (req, res) => {
    res.render("new");
});
app.listen(3000,(err) => {
    if(err) {
        throw err;
    } else {
        console.log('Fanrasy Parks Server is up and running on 3000');
    }
})
