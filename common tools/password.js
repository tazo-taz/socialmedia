const bcrypt = require("bcrypt");

module.exports.encryptPassword = (str) => bcrypt.hash(str, 12);

module.exports.comparePassword = (password = "", encrypted = "") =>
  bcrypt.compare(password, encrypted);
