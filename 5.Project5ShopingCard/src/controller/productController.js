//<----------------------< Importing : Packages >---------------------->//
const ProductModel = require('../models/productModel.js');
const aws = require('../AWS/AWS.js');
const productModel = require('../models/productModel.js');
const { validtitle, validPrice, validInstallments, ValidObjectId,
    isValidPrice, isValidAvailableSizes } = require('../validation/validData.js');

//<----------------------< Create : ProductFunction >--------------------->//

const createProduct = async (req, res) => {

    try {

        let data = req.body
        let file = req.files

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please input some data" });

        let { title, description, price, currencyId, currencyFormat, availableSizes, installments } = data;

        if (file && file.length > 0) {
            let image = await aws.uploadFile(file[0])
            data.productImage = image
        } else {
            return res.status(400).send({ status: false, message: "please provide the productImage" })
        }

        if (!title) return res.status(400).send({ status: false, message: "Title is mandatory" });
        if (!validtitle.test(title.trim())) return res.status(400).send({ status: false, message: "title not in valid format." })

        let duplicateTitle = await productModel.findOne({ title: title })
        if (duplicateTitle) return res.status(400).send({ status: false, message: "title already exist" })

        if (!description) return res.status(400).send({ status: false, message: "description is mandatory" });

        if (!price) return res.status(400).send({ status: false, message: "price is mandatory." });

        if (!validPrice.test(price)) return res.status(400).send({ status: false, message: "Invalid price" })

        if (!availableSizes) return res.status(400).send({ status: false, message: "availableSizes is mandatory." });

        if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is mandatory." });

        if (currencyId != "INR") return res.status(400).send({ status: false, message: "only indian currencyId INR accepted" })

        if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyFormat is mandatory." });
        if (currencyFormat != "₹") return res.status(400).send({ status: false, message: "only indian currency ₹ accepted " })


        if (!validInstallments.test(installments)) return res.status(400).send({ status: false, message: "Invalid installments" })

        const created = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: created })
    }
    catch (err) { return res.status(500).send({ status: false, message: err }) }
}

//<----------------------< get Product Data With Filera >----------------->//
const getProductDataWithFIlter = async function (req, res) {
    try {
        const queryParams = req.query

        let { size, name, priceGreaterThan, priceLessThan, priceSort } = queryParams


        const filterQuery = { isDeleted: false }

        if (size) {
            size = size.toUpperCase().split(",")
            if (!size) return res.status(400).send({ status: false, msg: "provide size" })
            for (let i = 0; i < size.length; i++) {

                if (!isValidAvailableSizes(size[i])) {
                    return res.status(400).send({ status: false, msg: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
            }

            filterQuery['availableSizes'] = { $in: size }
        };


        if (name) {
            if (!validtitle.test(name)) return res.status(400).send({ status: false, message: "provide Valid Title " })
            filterQuery['title'] = { $in: name }
        };
        if (priceGreaterThan) {
            if (!isValidPrice(priceGreaterThan))
                return res.status(400).send({ status: false, msg: "provide priceGreaterThan in numeric" })
            filterQuery['price'] = { $gt: priceGreaterThan }
        };

        if (priceLessThan) {
            if (!isValidPrice(priceLessThan))
                return res.status(400).send({ status: false, msg: "provide priceLessThan in numeric" })
            filterQuery['price'] = { $lt: priceLessThan }
        };


        if (priceSort) {
            if (!((priceSort == 1) || (priceSort == -1))) {
                return res.status(400).send({ status: false, message: "Price sort only takes 1 or -1 as a value" })
            }

            let filterProduct = await productModel.find(filterQuery).sort({ price: priceSort })

            if (Object.keys(filterProduct).length == 0) { return res.status(400).send({ status: false, message: "No products found with this query" }) }

            return res.status(200).send({ status: true, message: 'Success', data: filterProduct })
        }


        const products = await productModel.find(filterQuery).sort({ price: 1 })


        return res.status(200).send({ status: true, message: "Success", data: products })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};



//<----------------------< get Product Data With Filera >----------------->//
const getProductData = async (req, res) => {
    try {

        const productId = req.params.productId;

        if (!ValidObjectId(productId)) return res.status(400).send({ status: false, message: "Product Id not Valid" })

        if (!productId) return res.status(400).send({ status: false, message: "Pls Provide the Product Id" });

        const data = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!data) return res.status(400).send({ status: false, message: "Product data not present Data Base" });

        res.status(400).send({ status: true, data: data })
    }
    catch (err) { return res.status(500).send({ message: err }) }
}


//<----------------------< Update Product Data >-------------------------->//

const updateProduct = async (req, res) => {
    try {

        const productId = req.params.productId;

        if (!ValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" });

        const data = req.body;

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Pls Provide the Data" });

        const { title, description, price, currencyId, currencyFormat, availableSizes, installments } = data;


        const check = await productModel.findOne({ _id: productId, isDeleted: true });
        if (check) return res.status(400).send({ status: false, message: "Product is already deleted" });

        if (title) {
            if (!validtitle.test(title)) return res.status(400).send({ status: false, message: "Title is not Valid" });
        }

        if (description) {
            if (!description) return res.status(400).send({ status: false, message: "description is not Valid" });
        }

        if (price) {
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "price ₹ is not Valid pls Provide the Number " });
        }

        if (currencyId) {
            if (!(currencyId) || currencyId != "INR") return res.status(400).send({ status: false, message: "currencyId is not Valid" });
        }

        if (currencyFormat) {
            if (!(currencyFormat || currencyFormat != "₹")) return res.status(400).send({ status: false, message: "currencyFormat is not Valid pls provide right currency like this ₹" });
        }

        if (availableSizes) {
            if (!isValidAvailableSizes(availableSizes)) return res.status(400).send({ status: false, msg: "Size should be among S, XS, M, X, L, XXL, XL"});
        }

        if (installments) {
            if (!isValidPrice(installments)) return res.status(400).send({ status: false, msg: "Pls Provide the Number"});
        }

        let Updatedproduct = await productModel.findOneAndUpdate({ _id: productId }, {
            title: title, description: description,
            price: price, currencyId: currencyId, currencyFormat: currencyFormat, availableSizes: availableSizes, 
            installments: installments
        },
            { new: true })

        res.status(400).send({ status: true, message: "Product update is successful", data: Updatedproduct })
    }
    catch (err) { return res.status(500).send({ status: false, Message: err.message }) }

}

//<----------------------< Delete Product Data >--------------------------->//
const deleteproduct = async (req, res) => {
    try {
        let productId = req.params.productId;


        if (!ValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" });


        let savedData = await productModel.findById(productId)
        if (!savedData) {

            return res.status(404).send({ msg: "No such productId is present" });
        }

        if (savedData.isDeleted)
            return res.status(404).send({ status: false, msg: "you have already deleted the product" });

        await productModel.findByIdAndUpdate(savedData, { $set: { isDeleted: true, deletedAt: Date.now() } });
        res.status(200).send({ status: true, msg: "product is sucessfully deleted" });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}
//<----------------------< Exports : UserFunction >------------------------>//
module.exports = { createProduct, getProductDataWithFIlter, getProductData, updateProduct, deleteproduct }