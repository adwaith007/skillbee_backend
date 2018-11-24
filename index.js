const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
const secret=require("./config/secret");
const path=require("path");
const Person=require("./models/person");
const ITI=require("./models/iti");
const Course=require("./models/courses");
const mongoose=require("mongoose");
//const seeder=require('./seeder');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/public",express.static("public"));

mongoose.connect(secret.database, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("connected to database");
    }
});


const storage = multer.diskStorage({
    destination: './public/imagestore/',
    filename: function(req, file, cb){
      cb(null,req.session.user._id + '-' + Date.now() + path.extname(file.originalname));
    }
  });


const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('picture');
  
  // Check File Type
  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }

app.get("/fetchData/:ITI", function(req,res){
    ITI.findById(req.params.ITI, function(err,iti){
        if(err){
            console.log(err);
            console.log("fail at iti");
            handleerror(res);
        } 
        else if(!iti) invalidreq(res);
        else {
            Person.find({iti: iti}).populate("course", "iti").exec(function(err,people){
                if(err) {
                    console.log("fail at fin");
                    handleerror(res);
                }
                else{
                    res.json({
                        success: true,
                        people: people
                    })
                }
            })
        }
    })

})

app.get('/iti', function(req,res){
        ITI.find({}, function(err,itis){
            if(err) handleerror(res);
            else{
                res.json({
                    success: true,
                    itis: itis
                })
            }
        })
});

app.post('/addperson', function(req,res){
    if(!req.body.name||!req.body.experience||!req.body.course||!req.body.iti||!req.body.image||!req.body.year){
        invalidreq(res);
    }
    else{
        ITI.findById({_id:req.body.iti},function(err,iti){
            if(err) handleerror(res);
            else if(!iti) invalidreq(res);
            else{
                Course.findById({_id:req.body.course}, function(err,course){
                    if(err) handleerror(res);
                    else if(!course) invalidreq(res);
                    else{
                        const person = new Person();
                        person.name=req.body.name;
                        person.experience=req.body.experience;
                        person.course=req.body.course;
                        person.iti=req.body.iti;
                        person.year=req.body.year;
                        if(req.file){
                            upload(req,res,function(err){
                                if(err) handleerror(res);
                                else{
                                    person.picture=req.file.path.toString();
                                    person.save();
                                    res.json({
                                        success: true,
                                        message: "Successfully added new person!"
                                    })
                                }
                            }) 
                        }
                        else{
                            person.save();
                            res.json({
                                success: true,
                                message: "Successfully added new person!"
                            })
                        }
                    }
                })
            }
        })
    }
})

function invalidreq(res){
    res.json({
        success: false,
        message: "Invalid Request"
    })
}

function handleerror(res){
    res.json({
        success: false,
        message: "Internal Server Error"
    })
}

app.listen(3000, process.env.IP, function(){
    console.log("server started");
})