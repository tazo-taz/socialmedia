const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { _QUERY, _QUERY_ONE } = require("../DB/default");
const { SELECT_ONE_BY, SELECT_ONE } = require("../common tools/mysql");
const { comparePassword } = require("../common tools/password");
module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await SELECT_ONE_BY({
            TABLE: "users",
            WHERE: `email = '${email}'`,
          });

          if (!user) {
            return done(null, false, { message: "That email does't exist" });
          } else if (await comparePassword(password, user.password)) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect password" });
          }
        } catch (error) {
          console.log(error);
        }
      }
    )
  );
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(async function (user, done) {
    try {
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
