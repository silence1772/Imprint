const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 时间戳转文字描述
 */
function formatMsgTime(timestamp) {
  // 获取时间戳时间
  var dateTime = new Date(timestamp * 1000);
  // 获取当前时间戳10位
  var now = Math.round(new Date().getTime() / 1000);
  var seconds = 0;
  var timeSpanStr;
  // 时间差
  seconds = now - timestamp;
  // 时间戳格式化
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
  var day = dateTime.getDate();
  var hour = dateTime.getHours();
  var minute = dateTime.getMinutes();
  var second = dateTime.getSeconds();

  if (seconds <= 60 * 1) {
    timeSpanStr = '刚刚';
  }
  else if (60 * 1 < seconds && seconds <= 60 * 60) {
    timeSpanStr = Math.round((seconds / (60))) + '分钟前';
  }
  else if (60 * 60 * 1 < seconds && seconds <= 60 * 60 * 24) {
    timeSpanStr = Math.round(seconds / (60 * 60)) + '小时前';
  }
  else if (60 * 60 * 24 < seconds && seconds <= 60 * 60 * 24 * 15) {
    timeSpanStr = Math.round(seconds / (60 * 60 * 24)) + '天前';
  }
  else if (seconds > 60 * 60 * 24 * 15 && year == now.getFullYear()) {
    timeSpanStr = month + '-' + day + ' ' + hour + ':' + minute;
  } else {
    timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
  }
  return timeSpanStr;
}

function Rad(d) {
  return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
}
//计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
function GetDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = Rad(lat1);
  var radLat2 = Rad(lat2);
  var a = radLat1 - radLat2;
  var b = Rad(lng1) - Rad(lng2);
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;// EARTH_RADIUS;
  s = Math.round(s * 10000) / 10; //输出为米
  //s=s.toFixed(4);
  return s;
}

module.exports = {
  formatTime: formatTime,
  formatMsgTime: formatMsgTime,
  GetDistance: GetDistance,
}
