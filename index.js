import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import http from "http";
import userRouter from "./routes/user.js";
import Message from "./models/Message.js";
import User from "./models/User.js";

const app = express();
const PORT = 4000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = ["general", "news", "finance"];

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);

async function getLastMessagesFromRoom(room) {
  let roomMessages = await Message.aggregate([
    { $match: { to: room } },
    {
      $group: {
        _id: "$date",
        messagesByDate: { $push: "$$ROOT" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return roomMessages;
}

// function sortRoomMessagesByDate(messages) {
//   return messages.sort(function (a, b) {
//     let date1 = a._id.split("/");
//     let date2 = b._id.split("/");

//     date1 = date1[2] + date1[0] + date1[1];
//     date2 = date2[2] + date2[0] + date2[1];

//     return date1 < date2 ? -1 : 1;
//   });
// }

io.on("connection", (socket) => {
  socket.on("new-user", async () => {
    const members = await User.find();
    io.emit("new-user", members);
  });

  socket.on("join-room", async (newRoom, previousRoom) => {
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    // roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit("room-messages", roomMessages);
  });

  socket.on(
    "message-room",
    async ({ currentRoom, message, user, time, todayDate }) => {
      await Message.create({
        content: message,
        from: user,
        time,
        date: todayDate,
        to: currentRoom,
      });
      let roomMessages = await getLastMessagesFromRoom(currentRoom);
      // roomMessages = sortRoomMessagesByDate(roomMessages);
      io.to(currentRoom).emit("room-messages", roomMessages);
      socket.broadcast.emit("notifications", currentRoom);
    }
  );
});
app.get("/rooms", (req, res) => {
  res.json(rooms);
});

mongoose
  .connect(
    `mongodb+srv://MaxRozh:qwerty12345@cluster0.iccbyjp.mongodb.net/users?retryWrites=true&w=majority`
  )
  .then(() =>
    server.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`))
  )
  .catch((error) => console.log(`${error} did not connect`));
