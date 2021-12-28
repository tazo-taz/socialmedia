function isNum(a, empty) {
  return (
    (typeof a == "number" || (empty?.length ? empty.includes(a) : true)) &&
    !isNaN(a) &&
    String(a).length
  );
}

function isStr(a, empty = []) {
  return typeof a == "string" || (empty?.length ? empty.includes(a) : true);
}

function isDate(a) {
  return Date.parse(a) && !isNum(a);
}

module.exports.isEmail = (email) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase()
  );

module.exports.is = (str, arr) => arr.includes(str);

module.exports.isBoolean = (str) => typeof str == "boolean";

module.exports.isNum = isNum;
module.exports.isStr = isStr;
module.exports.isDate = isDate;
