//<----------------------< Importing : Packages >---------------------->//
const mongoose = require('mongoose');
//<----------------------< Create : UserSchema >----------------------->//
const productSchema = new mongoose.Schema({

  title: { type : String, mandatory : true, unique : true, trim : true },

  description: { type:String, mandatory:true, trim : true },

  price: { type:Number, mandatory:true, trim : true },
  
  currencyId: { type:String, mandatory:true,default:"INR", trim : true },//IND

  currencyFormat: { type:String, mandatory:true, trim : true,default:"₹" },

  isFreeShipping: { type:Boolean, default: false, trim : true },

  productImage: { type:String, mandatory:true },  // s3 link

  style: { type:String },

  availableSizes: { type:String, enum : ["S", "XS","M","X", "L","XXL", "XL"], trim : true },

  installments: { type:Number },

  deletedAt: { type : Date, default : null }, 

  isDeleted: { type:Boolean, default: false}
},

{timestamps:true})

//<----------------------< Exports : UserModel >----------------------->//
module.exports=mongoose.model('productModel', productSchema)