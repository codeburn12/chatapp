const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const chatModel = require("../models/chatModel");

const acessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId as params not send");
    return res.sendStatus(400);
  }

  var isChat = await chatModel
    .find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await userModel.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email pic",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      sender: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
  }

  try {
    const createChat = await chatModel.create(chatData);
    const fullChat = await chatModel
      .findOne({ _id: createChat._id })
      .populate("users", "-password");
    res.status(200).json(fullChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    chatModel
      .find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage", "-password")
      .populate("groupAdmin")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await userModel.populate(result, {
          path: "latestMessage.sender",
          select: "name email pic",
        });
        res.status(200).send(result);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    res.status(400).send("Must have more than 2 member to create group");
  }

  users.push(req.user);

  try {
    const createGroup = await chatModel.create({
      chatName: req.body.name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    });

    const fullGroup = await chatModel
      .findOne({ _id: createGroup._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(fullGroup);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const removeGroup = await chatModel
    .findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removeGroup) {
    res.status(404);
    throw new Error("Group not found");
  } else {
    res.json(removeGroup);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const addGroup = await chatModel
    .findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addGroup) {
    res.status(404);
    throw new Error("Group not found");
  } else {
    res.json(addGroup);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updateGroup = await chatModel
    .findByIdAndUpdate(chatId, { chatName }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updateGroup) {
    res.status(404);
    throw new Error("Group not found");
  } else {
    res.json(updateGroup);
  }
});

module.exports = {
  acessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
};
