//<-------------------------< Importing : Packages >---------------------->//
const express = require('express');
const { createUser, logInUserData, getUserData, updateUserData } = require('../controller/userController.js');
const { createProduct, getProductDataWithFIlter, getProductData,deleteproduct, updateProduct } = require('../controller/productController.js');
const { createCart, updateCart, getCart, deleteCart } =require('../controller/cartController.js')
const { authentication, authorization } = require('../middleware/auth.js');
const { createOrder, updateOrder } = require('../controller/orderController.js');
const router = express.Router();


//<======================== < User Data > =================================>//
//<------------------------< Create User Data >---------------------------->//
router.post('/register', createUser);
//<------------------------< LogIn User Data >------------------------------>//
router.post('/login', logInUserData);
//<------------------------< Get User Data >-------------------------------->//
router.get('/user/:userId/profile', authentication, authorization, getUserData);
//<------------------------< Update User Data >----------------------------->//
router.put('/user/:userId/profile', authentication, authorization,updateUserData);

//<========================= < Product Data > ===============================>//
//<-------------------------< Create Product Data >-------------------------->//
router.post('/products', createProduct);
//<-------------------------< get Product Data With Filera >----------------->//
router.get('/products', getProductDataWithFIlter);
//<-------------------------< get Product Data >----------------------------->//
router.get('/products/:productId', getProductData);
//<-------------------------< Update Product Data >-------------------------->//
router.put('/products/:productId', updateProduct);
//<------------------------< Delete Product Data >--------------------------->//
router.delete('/products/:productId',deleteproduct);

//<======================== < Cart Data > ===================================>//
//<------------------------< Create Cart Data >------------------------------>//
router.post('/users/:userId/cart', createCart);
//<------------------------< Update Cart Data >------------------------------>//
router.put('/users/:userId/cart', authentication, authorization,  updateCart);
//<------------------------< get Cart Data >--------------------------------->//
router.get('/users/:userId/cart', authentication, authorization, getCart);
//<------------------------< Delete Cart Data >------------------------------>//
router.delete('/users/:userId/cart', authentication, authorization, deleteCart);

//<======================= < Order Data > ===================================>//
//<------------------------< Create Cart Data >------------------------------>//
router.post("/users/:userId/orders", authentication, authorization, createOrder);
//<------------------------< Update Cart Data >------------------------------>//
router.put("/users/:userId/orders", authentication, authorization, updateOrder);

//<------------------------< Check All API Path >---------------------------->//
router.all('/*', (req,res) =>{
    return res.status(400).send({status:false,message:"Given path are not found !!!"})
});

//<------------------------< Exports : router >------------------------------>//
module.exports = router;
