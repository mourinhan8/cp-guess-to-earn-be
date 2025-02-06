const handlerCompleted = (job) => {
  console.info(`Guess handling id:${job.id} has completed`);
  job.remove();
};

const handlerFailure = (job, err) => {
  console.info(`Guess handling failed for: ${job.id} with ${err}. `);
};

const handlerStalled = (job) => {
  console.info(`Guess handling stalled for: ${job.id}`);
};

module.exports = {
  handlerCompleted,
  handlerFailure,
  handlerStalled,
};
