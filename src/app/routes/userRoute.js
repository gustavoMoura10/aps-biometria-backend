const { Router } = require("express");
const { saveUser, findAllUsers } = require("../controllers/userController");
const { auth } = require("../middlewares/interceptor");
const router = Router();

router.post("/saveUser", auth, saveUser);
router.get("/findAllUsers", auth, findAllUsers);

module.exports = router;
