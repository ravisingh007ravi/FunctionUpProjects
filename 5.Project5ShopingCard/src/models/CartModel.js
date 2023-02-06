const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId: { type : ObjectId, ref : 'UserModel', mandatory : true, unique : true },
    items: [{
      productId: { type : ObjectId, ref : "productModel", mandatory : true},
      quantity: { type : Number, mandatory : true, } //min 1
    }],
    totalPrice: { type : Number, mandatory : true, default : 0},
    totalItems: { type : Number, mandatory : true}

},
{timestamps:true});

//<----------------------< Exports : router >-------------------------->//
module.exports = mongoose.model('cartdata',cartSchema)