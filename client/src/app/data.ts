export interface data {
    email: string,
    data_arr: [{
        orderId: string,
        purchaseDate: Date,
        orderStatus: string,
        buyerEmail: string,
        buyerName: string,
        itemName: string,
        quantityOrdered: number
    }]
}