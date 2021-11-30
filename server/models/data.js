let mongoose = require("mongoose"),
 dataSchema = mongoose.Schema({
    email: String,
    data_arr: [{
        orderId: String,
        purchaseDate: Date,
        orderStatus: String,
        buyerEmail: String,
        buyerName: String,
        itemName: String,
        quantityOrdered: Number,
        isSent: Boolean,
        unSend: Boolean
    }]

  });

module.exports = mongoose.model("Data", dataSchema, 'data');