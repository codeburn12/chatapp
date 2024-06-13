const express = require("express");
const router = express.Router();

const {
  acessChat,
  fetchChats,
  createGroupChat,
  addToGroup,
  renameGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");
const { checkLoggedIn } = require("../middleware/authMiddleware");

router.route('/').post(checkLoggedIn, acessChat).get(checkLoggedIn, fetchChats)
router.route('/group').post(checkLoggedIn, createGroupChat)
router.route('/addgroup').put(checkLoggedIn, addToGroup)
router.route('/rename').put(checkLoggedIn, renameGroup)
router.route('/removegroup').put(checkLoggedIn, removeFromGroup)

module.exports = router;
