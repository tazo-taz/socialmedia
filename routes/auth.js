const auth = require("../controllers/auth");
const use = require("../middleware/errorHandler");

const router = require("express").Router();

router.get("/user", use(auth.getUser));

router.post("/signin", use(auth.signIn));

router.post("/signup", use(auth.signUp));

router.delete("/user", use(auth.logout));

module.exports = router;
