const { Router } = require("express");
const {
  saveUser,
  findAllUsers,
  deleteUser,
} = require("../controllers/userController");
const { auth, isMinistro } = require("../middlewares/interceptor");
const router = Router();

router.post("/saveUser", auth, saveUser);
router.get("/findAllUsers", auth, findAllUsers);
router.delete("/deleteUser/:_id", auth, isMinistro, deleteUser);

module.exports = router;
