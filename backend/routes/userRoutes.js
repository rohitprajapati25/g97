const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userAuth = require("../middleware/userAuth");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", userAuth, userController.getProfile);
router.put("/profile", userAuth, userController.updateProfile);

module.exports = router;
