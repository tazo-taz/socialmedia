const passport = require("passport");
const { createFolder } = require("../common tools/file");
const { INSERT } = require("../common tools/mysql");
const { encryptPassword } = require("../common tools/password");
const { reactFolder } = require("../config/default");

module.exports.signInFunc = (req, res, next) => {
  passport.authenticate("local", function (error, user, info) {
    if (error) res.json({ error });
    if (info) return res.json({ error: info.message });
    if (user)
      req.login(user, async (error) => {
        if (error) res.json({ error });
        else
          return res.json({
            data: user,
          });
      });
  })(req, res, next);
};

module.exports.signUpFunc = async (data) => {
  const DATA = { ...data };
  try {
    oldPassword = DATA.password;
    DATA.password = await encryptPassword(DATA.password);
    const user = await INSERT({ TABLE: "users", DATA });
    createFolder(reactFolder + "/images/user/" + user.insertId);

    return { user };
  } catch (error) {
    return { error };
  }
};
