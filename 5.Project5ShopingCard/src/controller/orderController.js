//<----------------------< Importing : Module >---------------------->//
const orderModel = require('../models/OrderModel.js')
const cartModel = require('../models/CartModel.js')
const UserModel = require('../models/userModel.js')
const { ValidObjectId } = require('../validation/validData.js')
const { } = require('../validation/validData.js')


//<----------------------< Create : Order Function >--------------------->//

const createOrder = async (req, res) => {
    try {


        let data = req.body;
        let userId = req.params.userId;

        if (Object.keys(data).length == 0)
            return res.status(400).send({ status: false, message: " Enter Cart details" });


        let { cartId, cancellable, status } = data

        const findUser = await UserModel.findById(userId);

        if (!findUser) return res.status(404).send({ status: false, message: "User not found" });

        if (!(cartId)) return res.status(400).send({ status: false, message: "cartId is Required" });

        if (!ValidObjectId(cartId)) return res.status(400).send({ status: false, message: "cartId is Not Valid" });


        let cartExist = await cartModel.findById(cartId);

        if (!cartExist) return res.status(404).send({ status: false, message: "Cart not found" })

        if (cartExist.userId != userId) return res.status(400).send({ status: false, message: "Cart id and userId are not matched" })

        if (cancellable) {
            if (typeof cancellable != "boolean") {
                return res.status(400).send({ status: false, message: "Cancellable should be true or false only" })
            }
        }

        if (status) {
            let validStatus = ["pending", "completed", "canceled"];

            if (!validStatus.includes(status)) {
                return res.status(400).send({ status: false, message: `status should be one of this :-"pending", "completed", "canceled"` })
            }
            if (status == "completed" || status == "canceled") {
                return res.status(400).send({ status: false, message: "status should be  pending while creating order" })
            }
        }

        let newQuantity = 0;
        for (let i = 0; i < cartExist.items.length; i++) {
            newQuantity = newQuantity + cartExist.items[i].quantity

        }
        const newOrder = {
            userId: userId,
            items: cartExist.items,
            totalPrice: cartExist.totalPrice,
            totalItems: cartExist.totalItems,
            totalQuantity: newQuantity,

        }

        const order = await orderModel.create(newOrder)
        return res.status(201).send({ status: true, message: "Success", data: order })


    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

// ------------------------------------Update order------------------------------------------------------------


const updateOrder = async function (req, res) {
    try {

        const body = req.body

        if (Object.keys(body) == 0) return res.status(400).send({ status: false, message: "please provide data" })


        const userId = req.params.userId;

        const userSearch = await UserModel.findById(userId)

        if (!userSearch) return res.status(400).send({ status: false, message: "userId does not exist" })

        const { orderId, status, cancellable } = body

        if (!orderId) return res.status(400).send({ status: false, message: "orderId is required" })

        if (!ValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Invalid orderId" })

        if (!status) return res.status(400).send({ status: false, message: "status is required" })

        const orderSearch = await orderModel.findOne({ _id: orderId })

        if (!orderSearch) return res.status(400).send({ status: false, message: "order does not exist" })

        if (orderSearch.isDeleted == true) return res.status(400).send({ status: false, message: "order is already deleted" })

        const cartSearch = await cartModel.findOne({ totalitems: 0 })

        if (cartSearch) return res.status(400).send({ status: false, message: "cart does not exist" })

        if (orderSearch.isDeleted == true) return res.status(400).send({ status: false, message: "order is already deleted" })

        const userSearchInOrder = await orderModel.findOne({ userId: userId })

        if (!userSearchInOrder) return res.status(400).send({ status: false, message: "user does not exist" })

        if (orderSearch.cancellable == false) return res.status(400).send({ status: false, message: "Order is not cancellable" })

        if ((orderSearch.status) == "completed") return res.status(400).send({ status: false, message: "Order is already completed, so it can't be updated" })

        if ((orderSearch.status) == "cancelled") return res.status(400).send({ status: false, message: "Order is cancelled, so it can't be updated" })

        if (orderSearch.cancellable == true && orderSearch.status == 'pending') {
            let updatedData = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status, cancellable: cancellable } }, { new: true })
            return res.status(200).send({ status: true, message: "Success", data: updatedData });
        }
    }
    catch (error) {
        res.status(500).send({ message: "Error", error: error.message })
    }
}

module.exports = { createOrder, updateOrder }