const multer = require("multer");
const { reactFolder } = require("../config/default");

const storage = (uid) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, reactFolder + "/images/user/" + uid);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "--" + file.originalname);
    },
  });

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("jpeg") ||
    file.mimetype.includes("png") ||
    file.mimetype.includes("jpg")
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = (req, res, cb, uid) =>
  multer({ storage: storage(uid), fileFilter: fileFilter }).array("images")(
    req,
    res,
    cb
  );
