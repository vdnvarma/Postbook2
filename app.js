const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('./config/multerconfig');


const userModel = require('./models/user');
const postModel = require('./models/post');

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());

app.get('/', (req,res) => {
    res.render("index");
});

app.get('/login', (req,res) => {
    res.render("login");
});

app.post('/register', async (req,res) =>{
    let {email, password, username, name, age} = req.body;
    let user = await userModel.findOne({email});
    if(user) return res.status(500).send("User already registered");

    bcrypt.genSalt(10, (err,salt) =>{
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                username,
                email,
                age,
                name,
                password: hash
            });
            let token = jwt.sign({email: email, userid: user._id}, "shhhh");
            res.cookie("token", token);
            res.redirect("/dashboard");
        });
    });
});

app.get('/dashboard', isLoggedIn, async (req,res) => {
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    res.render('dashboard',{user},);
});

app.get('/edituser/:id/upload', async (req,res) => {
    let user = await userModel.findOne({_id: req.params.id});
    res.render('profilepicupload',{user});
});

app.post('/upload', isLoggedIn, upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    
    let user = await userModel.findOne({ email: req.user.email });
    if (!user) {
        return res.status(404).send("User not found.");
    }

    user.profilepic = req.file.filename;
    await user.save();
    return res.redirect(`/profile/${user._id}`);
});

app.get('/like/:id', isLoggedIn, async (req,res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate("user");

    if(post.Likes.indexOf(req.user.userid) === -1){
        post.Likes.push(req.user.userid);
    }
    else{
        post.Likes.splice(post.Likes.indexOf(req.user.userid));
    }
    await post.save();
    res.redirect('/dashboard');
});

app.post('/post', isLoggedIn, async (req,res) => {
    let user = await userModel.findOne({email: req.user.email});
    let {content} = req.body;
    let post = await postModel.create({
        user: user._id,
        content
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/dashboard");
});

app.post('/update/:id', isLoggedIn, async (req,res) => {
    let post = await postModel.findOneAndUpdate({_id: req.params.id},{content: req.body.content});
    res.redirect("/dashboard");
});

app.get('/profile/:id', isLoggedIn, async (req,res) => {
    let user = await userModel.findOne({_id: req.params.id});
    res.render("profile",{user});
});

app.post('/login', async (req,res) =>{
    let {email, password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("Something went wrong!!!");

    bcrypt.compare(password,user.password,function(err,result){
        if(result){
            let token = jwt.sign({email: email, userid: user._id}, "shhhh");
            res.cookie("token", token);
            res.status(200).redirect("/dashboard");
        }
        else res.redirect('/login');
    });
});

app.get('/edit/:id', isLoggedIn, async (req,res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate("user");
    res.render('edit',{post});
});

app.post('/updateuser/:id', isLoggedIn, async (req,res) => {
    let {name, age, oldpassword, newpassword} = req.body;
    let user = await userModel.findOneAndUpdate({_id: req.params.id},{name : name, age : age});
    if(oldpassword.length>0 && newpassword.length>0){
        bcrypt.compare(oldpassword,user.password,async function(err,result){
            if(result){
                let uid = req.params.id;
                bcrypt.genSalt(10, (err,salt) =>{
                    bcrypt.hash(newpassword, salt, async (err, hash) => {
                        let user = await userModel.findOneAndUpdate({_id:uid},{password: hash});
                    });
                });
                return res.redirect(`/profile/${req.params.id}`);
            }
            else return res.send("Password incorrect");
        });
    }
    else{
        return res.redirect(`/profile/${req.params.id}`);
    }
});

app.get('/edituser/:id', isLoggedIn, async (req,res) => {
    let user = await userModel.findOne({_id: req.params.id});
    res.render('edituser',{user});
});

app.get('/delete/:id', isLoggedIn, async (req,res) => {
    let post = await postModel.findOneAndDelete({_id: req.params.id});
    res.redirect("/dashboard");
});

app.get('/deleteuser/:id', isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.id });

    if (!user) {
        return res.status(404).send("User not found.");
    }
    for (const post of user.posts) {
        await postModel.findOneAndDelete({ _id: post });
    }
    await userModel.findOneAndDelete({ _id: req.params.id });
    res.redirect("/login");
});

app.get('/logout', (req,res) => {
    res.cookie("token", "");
    res.redirect("/login")
});

function isLoggedIn(req,res,next){
    if(req.cookies.token === "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token,"shhhh");
        req.user = data;
    }
    next();
    
};

app.listen(3000);