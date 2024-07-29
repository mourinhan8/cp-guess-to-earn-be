const { guessQueue, guessProcess } = require('./queue/guess');
const dotenv = require("dotenv");
const path = require("path");
const { createServer } = require("http");
const envFilePath = path.resolve(__dirname, `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`);
dotenv.config({ path: envFilePath });
const { initSocket } = require("./socket/io");
const { connectDB, closeDBConnection } = require("./config/db");
const { socketHandler } = require("./socket/socketHandler");

const PORT = process.env.QUEUE_PORT || 4041;
global.onlineUsers = new Map();

const server = createServer();

initSocket(server, socketHandler);

let serverInstance;

if (!serverInstance) {
  serverInstance = server.listen(PORT,
    () => console.log(`Queue started on port ${PORT}`
    ));
} else {
  console.log('Queue is already running.');
}

connectDB(process.env.MONGO_URL)
  .then(() => {
    guessQueue.process(
      1,
      function async(job, done) {
        guessProcess(job.data);
        done();
      }
    );
    console.log("Queue started");
  })
  .catch((err) => {
    console.log(err);
  });



process.on('SIGINT', () => {
  closeDBConnection();
});

