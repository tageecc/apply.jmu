exports.arrayDel = function (arr, item) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == item) return i;
    }
    return -1;

};
exports.timeNow = function(){
    var date = new Date();
    return new Date(date.getFullYear(),date.getMonth()+1,date.getDate());
};
exports.day = function(day){
    var date = new Date(new Date().getTime()+day*24*60*60*1000);
    return new Date(date.getFullYear(),date.getMonth(),date.getDate());
};
exports.decrement = function(date,days){
    //days ÌìÊý
    return this.day(new Date(new Date(date).getTime()-days*24*60*1000));
};