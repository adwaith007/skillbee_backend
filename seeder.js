const Person=require("./models/person");
const ITI=require("./models/iti");
const Course=require("./models/courses");

function seeder(){
    // for(var i=0;i<5;i++){
    //     const iti= new ITI();
    //     iti.name="ITI "+i;
    //     iti.image="/ITI/image"+i+".jpg";
    //     iti.save();
    // }

    // for(var i=0;i<5;i++){
    //     const course = new Course();
    //     course.name="Course "+i;
    //     course.duration=1+i%3;
    //     course.save();
    // }

        ITI.find({}, function(err,itis){
            if(err) throw err;
            else{
                Course.find({}, function(err,courses){
                    if(err) throw err;
                    else{
                        for(var i=0;i<10;i++){
                           const person= new Person();
                           person.name="Name "+i;
                           person.picture="/person/image"+Math.floor(Math.random() * 6)+".jpg";
                           person.experience=Math.floor(Math.random() * 4);  
                           person.year="200"+Math.floor(Math.random() * 10);
                           person.iti=itis[Math.floor(Math.random() * 5)];
                           person.course=courses[Math.floor(Math.random() * 5)];
                           person.job="Job"+i;
                           person.save();
                        }
                    }
                })
            }
        })

}

module.exports=seeder;