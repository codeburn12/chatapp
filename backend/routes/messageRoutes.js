const express = require("express");
const router = express.Router();

const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
const { checkLoggedIn } = require("../middleware/authMiddleware");

router.route("/").post(checkLoggedIn, sendMessage);
router.route("/:chatId").get(checkLoggedIn, allMessages);

module.exports = router;
