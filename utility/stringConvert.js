/**
 * @param s string 'hh:mm:ss'
 */
exports.StringToMin = (s) => {
    let arr = s.split(':').map(e => parseInt(e));
    let number = arr[0]*60 + arr[1] + Math.ceil(arr[2]/60);
    return number;
}

exports.stringToDate = (s) => {
    console.log(s);
    return (new Date(parseInt(s))).toISOString();
}