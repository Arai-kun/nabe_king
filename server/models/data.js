let mongoose = require("mongoose"),
 dataSchema = mongoose.Schema({
    email: String,
    data_arr: [{
        orderId: String,
        purchaseDate: Date,
        orderStatus: String,
        shippedDate: Date,
        buyerEmail: String,
        buyerName: String,
        itemName: String,
        isSent: Boolean,
        unSend: Boolean,
        sendTarget: Boolean,
        condition: String,
        subCondition: String,
        fullfillment: String
    }]

  });

module.exports = mongoose.model("Data", dataSchema, 'data');