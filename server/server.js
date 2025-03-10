const express = require("express");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const { createServer } = require("http");
const Chatbot = require("./chatEngine.js");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const chatbot = new Chatbot();

// Serve static files
app.use(express.static("dist"));

io.on("connection", (socket) => {
  console.log(`CONNECTED ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`DISCONNECTED ${socket.id}: ${reason}`);
  });

  socket.on("init", async (data) => {
    try {
      await chatbot.initialize(socket.id,data.language);
      socket.emit("responseInit", true);
      console.log(`INITIALIZED ${socket.id}`);
    } catch (err) {
      console.error(err);
      socket.emit("responseInit", false);
      console.log(`INIT FAILED ${socket.id}`);
    }
  });

  socket.on("message", async (data) => {
    try {
      if (!data || typeof data.question !== "string") {
        throw new TypeError("The 'question' property must be a string.");
      }
      const response = await chatbot.chat(data.question);
      const audioData = await chatbot.storeAudioFile(response);

      console.log(`RESPONSE (${socket.id}): ${response}`);
      console.log(`AUDIO (${socket.id}): ${audioData.audioFilePath}`);

      socket.emit("responseMessage", {
        response: response,
        speechData: audioData,
      });
    } catch (err) {
      console.error(`ERROR (${socket.id}):`, err.message);
      socket.emit("responseMessage", {
        response: "Sorry, I encountered an error processing your request.",
        audioData: null,
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});