/**
 * @param s string 'hh:mm:ss'
 */
exports.StringToSecond = (s) => {
    let arr = s.split(':').map(e => parseInt(e));
    let number = arr[0]*3600 + arr[1]*60 + arr[2];
    return number;
}

exports.stringToDate = (s) => {
    return (new Date(parseInt(s))).toISOString();
}