const express = require("express")
const app = express()

const cors = require("cors");
app.use(cors());

const dotenv = require('dotenv')
const connectDB = require("./config/db");
dotenv.config()

connectDB()

// Imported all routes
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')

const { notFound, errorHandler } = require('../backend/middleware/errorMiddleware')
app.use(express.json())

// All endpoints
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(
  process.env.PORT,
  console.log(`Server running on PORT ${process.env.PORT}`)
);

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000"
  }
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData.data._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on('typing', (room) => socket.in(room).emit("typing"));
  socket.on('stop typing', (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData.data._id);
  });
})
