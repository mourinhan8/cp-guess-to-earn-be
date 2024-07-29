const dotenv = require("dotenv");
const path = require("path");
const { createServer } = require("http");
const envFilePath = path.resolve(__dirname, `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`);
const app = require("./app/app");
const { closeDBConnection } = require("./config/db");
dotenv.config({ path: envFilePath });

const PORT = process.env.PORT || 4040;

const server = createServer(app);

let serverInstance;

if (!serverInstance) {
  serverInstance = server.listen(PORT,
    () => console.log(`Server started on port ${PORT}`
    ));
} else {
  console.log('Server is already running.');
}

process.on('SIGINT', () => {
  closeDBConnection();
});
