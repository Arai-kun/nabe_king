const schedule = require('node-schedule');

/* Main loop */
console.log('Start the scheduler program');
main();
//const job = schedule.scheduleJob('*/5 * * * * *', () => {
//    console.log('Start the scheduler program');
//    main();
//});
/*
let loop = async () => {
    while(1){
        console.log('Start the scheduler program');
        const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await _sleep(10000);
        main();
    }
}

loop();
*/

async function main() {
    console.log('Enter in main()');
    while(1){
        console.log('Enter in loop');
        const start = Date.now();
        const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await _sleep(1000);
        await update();
        console.log(Date.now() - start);
    }
}

async function update() {
    console.log('Enter in update()');
    const orders = [
        {
            orderId: 'A'
        },
        {
            orderId: 'B'
        },
        {
            orderId: 'C'
        }
    ];
    for(x of orders){
        const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await _sleep(1000);
        console.log(x.orderId);      
    }
    console.log('Escape in update()');
}


