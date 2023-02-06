//<----------------------< Importing : Packages >---------------------->//
const mongoose = require('mongoose')

//<----------------------< Create : UserSchema >----------------------->//
const UserSchema = new mongoose.Schema({

    fname : { type : String, mandatory : true, trim : true },

    lname : { type : String, mandatory : true, trim : true},

    email : { type : String, mandatory : true, unique : true, trim : true},

    profileImage : { type : String, mandatory : true, trim : true},

    phone : { type : String, mandatory : true, unique : true, trim : true},

    password : { type : String, mandatory : true, trim : true},

    address : { 
                  shipping : {
                               street : { type : String, mandatory : true, trim : true},
                               city: { type : String,  mandatory : true, trim : true},
                               pincode: { type : Number,  mandatory : true, trim : true}
                            },

                   billing : {
                               street : { type : String, mandatory : true, trim : true},
                               city : { type : String,  mandatory : true, trim : true},
                               pincode : { type : Number,   mandatory : true, trim : true}
                            }
                }
        },

        {timestamps : true})

//<----------------------< Exports : UserModel >----------------------->//
module.exports=mongoose.model('UserModel',UserSchema)