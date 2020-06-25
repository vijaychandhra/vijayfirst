const express=require('express');
const path=require('path');
const body=require('body-parser');
const passport=require('passport');
const multer=require('multer');
require('dotenv').config();
require('./pass/passport')(passport);
const app=express();
app.use(body.json());
app.use(body.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'view')));
app.set('views',path.join(__dirname,'view'));
app.set('view engine','ejs')
const mongoose=require('mongoose');
const db=require('./models/P');
const lg=require('./models/log');
const data=require('./models/db');
const bcrypt=require("bcryptjs");
const cors=require("cors");
app.use(cors());

app.use(passport.initialize());
app.use(passport.session());
const storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./get/");
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
    
});
app.use('/get',express.static('get'))
const upload=multer({storage:storage});
app.post('/post',(req,res,next)=>{
    const p=new db({
        name:req.body.name,
        price:req.body.price,
        product:req.body.product
    })
    p.save();
    res.send(p)
    //res.redirect('/main.html')
    

})
app.get('/',(req,res)=>{
    res.redirect('/login.html')
})

app.post('/login', (req,res,next)=>{
  passport.authenticate('local', { 
      successRedirect: '/main.html', 
      failureRedirect: '/login.html' })
    (req,res,next);
})
app.post('/signup',(req,res)=>{
    const p=new lg({
     name:req.body.name,
     password:req.body.password
    })
    bcrypt.genSalt(10,(err,salt)=>{
             bcrypt.hash(p.password,salt,(err,hash)=>{
                 if(err)throw err;
                 p.password=hash;
                 p.save().then((data)=>console.log(data)).catch((err)=>console.log(err));
             })
        })
        res.redirect('/login.html')
})

app.get('/findingallfiles',async(req,res)=>{
    try{
        var p=await db.find()
        
         res.render('abc',{p})
         //res.send(p)
    }
    catch(err){
        res.send('err')
    }
})
app.get('/come/:name',async(req,res)=>{
    try{
        const r=await db.findOne({name:req.params.name})
        const q=new data({
            name:r.name,
            price:r.price,
            product:r.product
        })
        q.save();
        const p= await db.find()
        res.render('abc',{p})
    }
    catch(err){
        res.send(err)
    }
})
app.get('/go',async(req,res)=>{
    
    const p= await data.find();
    res.render('pqr',{p})
})



app.post('/get',async(req,res)=>{
    try{
        const p=await db.find({name:req.body.name});
        res.send(p)
    }
    catch(err){
        res.send('err')
    }
})
 app.post('/delete',async(req,res)=>{
     try{
         await db.deleteOne({name:req.body.name})
         res.redirect('/main.html')
     }
     catch(err){
         res.send('err')
     }
 })

 app.get('/deleteall',async(req,res)=>{
     await db.deleteMany({});
     res.redirect('/main.html')
 })
mongoose.connect(process.env.MONGO,
{ useNewUrlParser: true,useUnifiedTopology:true },()=>console.log("connected to db"));
const q=process.env.PORT||3000;
app.listen(q,()=>{
    console.log(`listening to port ${q}`);
})