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

//seeder();

const storage = multer.diskStorage({
    destination: './public/person/',
    filename: function(req, file, cb){
      cb(null,"image" + '-' + Date.now() + path.extname(file.originalname));
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
            Person.find({iti: iti}).populate("course").populate("iti").exec(function(err,people){
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

app.get("/search", function(req,res){
    Person.find({name: {$regex: "^.*"+req.query.key+".*$", $options: 'i' }}).populate("course").populate("iti").exec(function(err,result){
        if(err){
            handleerror(res);
        }
        else{
            res.json({
                success: true,
                result: result
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

app.get('/list', function(req,res){
    Course.find({},function(err,courses){
        if(err) handleerror(res);
        else{
            ITI.find({}, function(err,itis){
                if(err) handleerror(res);
                else{
                    res.json({
                        success: true,
                        itis: itis,
                        courses:courses
                    })
                }
            })
        }
    })
})

app.post('/addperson', function(req,res){
    upload(req,res,function(err){
        if(err) handleerror(err);
        else if(!req.body.name||!req.body.experience||!req.body.job||!req.body.course||!req.body.iti||!req.body.year){
            console.log("fail at validation");
            console.log(req.name);
            invalidreq(res);
        }
        else{
            ITI.findById(req.body.iti,function(err,iti){
                if(err){
                    console.log(req.body.iti);
                    console.log("fail at iti err");
                    handleerror(res);
                } 
                else if(!iti) 
                {
                    console.log("fail at iti")
                    invalidreq(res);
                }
                else{
                    Course.findById(req.body.course, function(err,course){
                        if(err) handleerror(res);
                        else if(!course) {
                            console.log("fail at course");
                            invalidreq(res);
                        }
                        else{
                            const person = new Person();
                            person.name=req.body.name;
                            person.experience=req.body.experience;
                            person.course=req.body.course;
                            person.iti=req.body.iti;
                            person.year=req.body.year;
                            person.job=req.body.job;

                                    person.picture="/"+req.file.path.toString();
                                    person.save();
                                    res.json({
                                        success: true,
                                        message: "Successfully added new person!"
                                    })
                        }
                    })
                }
            })
        }
    })
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

app.listen(8000, process.env.IP, function(){
    console.log("server started");
})