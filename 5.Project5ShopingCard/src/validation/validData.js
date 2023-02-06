const mongoose =require('mongoose');

//<----------------------< Check : User Validation >--------------------->//

let validname = /[a-zA-z]/;

let validemail= /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

let validphone = /^[0]?[6789]\d{9}$/;

let validpassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

let validstreet = /[a-zA-z ]/;

let validcity = /[a-zA-z ]/;

let validpincode = /^[1-9]{1}[0-9]{5}$/;

const ValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
  }

  //<----------------------< Check : User Validation >--------------------->//

  let validtitle =/^[a-zA-z0-9 ]|[a-zA_Z ]$/;

  let validPrice =/^\d+(,\d{1,2})?$/;

  let validInstallments = /[0-9]/;
  

  const isValidPrice =(price)=>{
    return /^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price)
  }
  const isValid = function (value) {
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
  };
    const isValidAvailableSizes = function(size) {
      return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size) == true
    }

    //<----------------------< Check : Order Validation >--------------------->//

 //<----------------------< Exports : Validation >------------------------>// 
module.exports = { validname, validemail, validphone, validpassword, validstreet, validcity, validpincode, ValidObjectId,
                    validtitle, validPrice, validInstallments, isValidPrice, isValidAvailableSizes, isValid }