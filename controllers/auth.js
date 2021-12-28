const { signInFunc, signUpFunc } = require("../functions/auth");

module.exports.getUser = (req, res) => {
  res.json({ data: req.user });
};

module.exports.signIn = signInFunc;

module.exports.signUp = async (req, res, next) => {
  const { user, error } = await signUpFunc(req.body);
  if (error) {
    return res.json({
      error:
        error ==
        "Error: ER_DUP_ENTRY: Duplicate entry 'samfao.tj@gmail.com' for key 'email'"
          ? "That email is already registered"
          : error,
    });
  }

  signInFunc(req, res, next);
};

module.exports.logout = (req, res) => {
  req.logout();
  res.json({});
};
