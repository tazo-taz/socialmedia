module.exports.arraySum = (arr) => arr.reduce((a, b) => a + b, 0);

module.exports.arrayInExample = (arr) =>
  arr
    .map(
      (a, b, c) =>
        a + (b + 3 <= c.length ? "," : b + 2 == c.length ? " and" : "")
    )
    .join(" ");

    module.exports.dateInString = (date = new Date()) => date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()