const { readFolder, deleteFile } = require("../common tools/file");
const { reactFolder } = require("../config/default");

module.exports.getUserImagesFunc = (uid) =>
  readFolder(reactFolder + "/images/user/" + uid);

module.exports.deleteImageFunc = (name) =>
  deleteFile(reactFolder + "/images/user/" + name);
