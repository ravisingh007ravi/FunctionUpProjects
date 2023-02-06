const UserModel = require('../models/userModel.js');
const ProductsModel = require('../models/productModel.js')
const cartModel = require('../models/CartModel.js');
const { ValidObjectId } = require('../validation/validData.js')


const createCart = async (req, res) => {

    try {

        let userId = req.params.userId;
        let data = req.body;

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Pls provide the data" });

        let { productId, cartId, quantity } = data;

        if(!productId) return res.status(400).send({ status: false, message: "Pls provide the Product Id" });

        if(!ValidObjectId(productId)) return res.status(400).send({ status: false, message: "Pls provide the Valid Product Id" });        

        if(typeof(quantity)=="string") return res.status(400).send({ status: false, message: "Pls provide the quantity in the Number Format" });

        if (!quantity) { quantity = 1; }

        let ProductData = await ProductsModel.findById(productId);

        if (!ProductData) return res.status(400).send({ status: false, message: "productId is not correct" });

        let price = ProductData.price;

        

        let cartData = await cartModel.findOne({ userId: userId });

        if (!cartData) {
            let data = {
                userId: userId,
                items: [{ productId: productId, quantity: quantity }],
                totalPrice: (price * quantity).toFixed(2),
                totalItems: 1,
            };
            let createCart = await cartModel.create(data);
            res.status(201).send({ status: true, data: createCart });
        }

        else {
            let items = cartData.items;
            let totalPrice = cartData.totalPrice;
            let totalItems = cartData.totalItems;

            let flag = 0;
            // let NewQuantity = 0;
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId == productId) {
                    items[i].quantity += quantity;
                    // NewQuantity = items[i].quantity
                    flag = 1;
                }
            }
            if (flag == 1) {
                price = quantity * price + totalPrice;
                let data = {
                    totalPrice: price,
                    items: items,
                    totalItems: items.length
                };
                let updateCart = await cartModel.findOneAndUpdate(
                    { userId: userId },
                    { $set: data },
                    { new: true }
                );
                return res.status(201).send({ status: true, data: updateCart });
            }

            else if (flag == 0) {
                items.push({ productId: productId, quantity: quantity });
                price = price * quantity + totalPrice;
                totalItems = totalItems + 1;
                let data = {
                    items: items,
                    totalPrice: price,
                    totalItems: totalItems,
                };
                let updateCart = await cartModel.findOneAndUpdate(
                    { userId: userId },
                    { $set: data },
                    { new: true }
                );
                return res.status(201).send({ status: true, data: updateCart });
            }
        }
    }
    catch (err) { return res.status(500).send({ status: false, message: err.message }) }
}

const updateCart = async function (req, res) {
    try {
        const body = req.body
        const userId = req.params.userId;

        if (Object.keys(body) == 0) {
            return res.status(400).send({ status: false, msg: "Please provide data to update." });
        }

        if (!ValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters" });
        }

        const userSearch = await UserModel.findById(userId)
        if (!userSearch) {
            return res.status(400).send({ status: false, msg: "userId does not exist" })
        }

        // if(userId !== req.userId) {
        //     return res.status(401).send({status: false, msg: "Unauthorised access"})
        // }

        const { cartId, productId, removeProduct } = body

        if (!cartId) {
            return res.status(400).send({ status: false, msg: "CartId is required" })
        }

        if (!ValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "Invalid cartId" })
        }

        if (!productId) {
            return res.status(400).send({ status: false, msg: "productId is required" })
        }

        if (!ValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "Invalid productId" })
        }

        const cartSearch = await cartModel.findOne({ _id: cartId })
        if (!cartSearch) {
            return res.status(404).send({ status: false, msg: "Cart does not exist" })
        }

        const productSearch = await ProductsModel.findOne({ _id: productId })
        if (!productSearch) {
            return res.status(404).send({ status: false, msg: "product does not exist" })
        }

        if (productSearch.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "Product is already deleted" })
        }

        if ((removeProduct != 0) && (removeProduct != 1)) {
            return res.status(400).send({ status: false, msg: "Invalid remove product" })
        }


        const cart = cartSearch.items;

        for (let i = 0; i < cart.length; i++) {
            if (cart[i].productId == productId) {
                const priceChange = cart[i].quantity * productSearch.price
                if (removeProduct == 0) {
                    const productRemove = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, 
                        totalPrice: cartSearch.totalPrice - priceChange, totalItems: cartSearch.totalItems - 1 }, { new: true })

                    return res.status(200).send({ status: true, message: 'Success', data: productRemove })
                }

                if (removeProduct == 1) {
                    if (cart[i].quantity == 1 && removeProduct == 1) {
                        const priceUpdate = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, 
                            totalPrice: cartSearch.totalPrice - priceChange, totalItems: cartSearch.totalItems - 1 }, { new: true })

                        return res.status(200).send({ status: true, message: 'Success', data: priceUpdate })
                    }

                    cart[i].quantity = cart[i].quantity - 1
                    const updatedCart = await cartModel.findByIdAndUpdate({ _id: cartId }, { items: cart, totalPrice: cartSearch.totalPrice - productSearch.price }, { new: true })
                    return res.status(200).send({ status: true, message: 'Success', data: updatedCart })
                }
            }
            return res.status(400).send({ status: false, message: "Product does not found in the cart" })
        }

    }
    catch (error) {res.status(500).send({ msg: "Error", error: error.message })}
}


const getCart = async function (req, res) {
    try {
        let userId = req.params.userId;
        //if userId is given then is it valid or not
        if (userId) {
            if (!ValidObjectId(userId))
                return res.status(400).send({ status: false, msg: "wrong userId" });
        }
        // finding user in DB 
        let checkUserId = await UserModel.findOne({ _id: userId });
        if (!checkUserId) {
            return res.status(404).send({ status: false, message: "no user details found" });
        }
        // finding in cart 
        let getData = await cartModel.findOne({ userId });
        if (getData.items.length == 0)
            return res.status(400).send({ status: false, message: "items details not found" });
        //If not get
        if (!getData) {
            return res.status(404).send({ status: false, message: "cart not found" });
        }
        res.status(200).send({ status: true, message: "cart successfully", data: getData });
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId;


        if (!ValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }
        const findUser = await UserModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, message: `User doesn't exists by ${userId} ` })
        }


        const findCart = await cartModel.findOne({ userId: userId })
        if (!findCart) {
            return res.status(400).send({ status: false, message: `Cart doesn't exists by ${userId} ` })
        }
        //not deleting the cart, just changing their value to 0.
        const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })
        return res.status(204).send({ status: true, message: "Deleted data" })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


//<----------------------< Exports : UserFunction >------------------------>//
module.exports = { createCart, updateCart, getCart, deleteCart }