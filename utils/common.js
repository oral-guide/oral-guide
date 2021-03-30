function getUrlParams(url) {
  var temp1 = url.split('?');
  var pram = temp1[1];
  var keyValue = pram.split('&');
  var obj = {};
  for (var i = 0; i < keyValue.length; i++) {
    var item = keyValue[i].split('=');
    var key = item[0];
    var value = item[1];
    obj[key] = value;
  }
  return obj
}
function addZero(num) {
  return num >= 10 ? num : `0${num}`;
}
function formatTime(time) {
  let d = new Date(time);
  return `${d.getFullYear()}-${addZero(d.getMonth + 1)}-${addZero(d.getDate())} ${addZero(d.getHours())}:${addZero(d.getMinutes())}`;
}
export default {
  getUrlParams,
  formatTime
}