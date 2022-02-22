export interface data {
    email: string,
    data_arr: [{
        orderId: string,
        purchaseDate: string,
        orderStatus: string,
        itemName: string,
        isSent: boolean,
        unSend: boolean
    }]
}