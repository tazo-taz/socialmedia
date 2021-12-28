const { SELECT } = require("../common tools/mysql");

module.exports.addImagesToPostAddFunc = async (posts) => {
  posts = Array.isArray(posts) ? posts : [posts];
  for (let k of posts) {
    k.images = await SELECT({
      TABLE: "post_images",
      WHERE: `postUid = ${k.uid}`,
    });
  }
};
