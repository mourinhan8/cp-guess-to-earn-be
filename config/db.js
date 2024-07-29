const mongoose = require("mongoose");

const connectDB = async (dbUrl) => {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

const closeDBConnection = async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
};

module.exports = { connectDB, closeDBConnection };
