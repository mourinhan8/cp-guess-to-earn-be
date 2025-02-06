const Queue = require("bull");
const { handlerFailure, handlerCompleted, handlerStalled } = require("./guess.handler");

const guessQueue = new Queue("guessProcessing", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
});

guessQueue.on("completed", handlerCompleted);

guessQueue.on("error", handlerFailure);

guessQueue.on("failed", handlerStalled);

module.exports = guessQueue;
