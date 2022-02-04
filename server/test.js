const list = [
    {
        start: '23:00',
        end: '8:00'
    },
    {
        start: '9:00',
        end: '17:00'
    },
    {
        start: '14:10',
        end: '14:43'
    },
    {
        start: '14:59',
        end: '14:30'
    }
];

list.forEach(test => {
    console.log(`${test.start}~${test.end}`);
    try{
        console.log(checkRestrictDulation(test.start, test.end));
    }
    catch(e){
        console.log(e);
    }
});

function checkRestrictDulation(start, end){
    const now = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    console.log(now);
    const startDate = new Date(Date.parse(`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${start}`) 
                        + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    console.log(startDate.toISOString());
    const endDate = new Date(Date.parse(`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${end}`)
                        + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    console.log(endDate);
    console.log(`${startDate.getHours()}:${startDate.getMinutes()}`);
    console.log(`${endDate.getHours()}:${endDate.getMinutes()}`);
    if(startDate.getHours() < endDate.getHours() || 
        (startDate.getHours() === endDate.getHours() && startDate.getMinutes() < endDate.getMinutes())){
            console.log(`${startDate.getTime()}<=${now.getTime()}&&${now.getTime()}<${endDate.getTime()}`);
        if(startDate.getTime() <= now.getTime() && now.getTime() < endDate.getTime()){

            return true;
        }
    }
    else if(startDate.getHours() > endDate.getHours() ||
        (startDate.getHours() === endDate.getHours() && startDate.getMinutes() > endDate.getMinutes())){
        if(endDate.getTime() > now.getTime() || now.getTime() >= startDate.getTime()){
            return true;
        }
    }
    return false;
}