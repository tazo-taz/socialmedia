const album = require("../controllers/album");
const use = require("../middleware/errorHandler");
const { isUser } = require("../middleware/statusCheck");

const router = require("express").Router();

router.get("/userimages", isUser, use(album.getUserImages));

router.post("/uploadimgs", isUser, use(album.uploadImages));

router.delete("/userimage/:name", isUser, use(album.deleteImage));

module.exports = router;
