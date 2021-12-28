const { DELETE_BY } = require("../common tools/mysql");
const { getUserImagesFunc, deleteImageFunc } = require("../functions/album");
const album = require("../multer/album");

module.exports.getUserImages = async (req, res) => {
  data = getUserImagesFunc(req.user.uid);
  res.json({ data });
};

module.exports.uploadImages = async (req, res) =>
  album(
    req,
    res,
    () => {
      data = getUserImagesFunc(req.user.uid);
      res.json({ data });
    },
    req.user.uid
  );

module.exports.deleteImage = async (req, res) => {
  const imgName = req.user.uid + "/" + req.params.name;
  deleteImageFunc(imgName);
  data = getUserImagesFunc(req.user.uid);
  DELETE_BY({ TABLE: "post_images", WHERE: `url = "${imgName}"` });
  res.json({ data });
};
