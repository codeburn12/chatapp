const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const chatModel = require("../models/chatModel");
const messageModel = require("../models/messageModel");

const allMessages = asyncHandler(async (req, res) => {
  try {
    const message = await messageModel
      .find({ chat: req.params.chatId })
      .populate("sender", "name email pic")
      .populate("chat");
    res.json(message);
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid requested data");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await messageModel.create(newMessage);
    message = await message.populate("sender", "name pic").execPopulate()
    message = await message.populate("chat").execPopulate()
    message = await userModel.populate(message, {
      path: "chat.users",
      select: "name email pic",
    });

    await chatModel.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  allMessages,
  sendMessage,
};
