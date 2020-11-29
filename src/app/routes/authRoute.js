const { Router } = require("express");
const { login, newToken } = require("../controllers/authController");
const { auth } = require("../middlewares/interceptor");
const router = Router();

router.post("/login/:type", login);
router.get("/newToken", auth, newToken);

module.exports = router;
