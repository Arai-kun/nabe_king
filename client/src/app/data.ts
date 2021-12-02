export interface data {
    email: string,
    data_arr: [{
        orderId: string,
        purchaseDate: string,
        orderStatus: string,
        buyerEmail: string,
        buyerName: string,
        itemName: string,
        quantityOrdered: number,
        isSent: boolean,
        unSend: boolean
    }]
}