require("dotenv").config();
const createServer = require("./startup/createServer");
const db = require("./startup/db");
const auth = require("./src/middleware/auth/auth");
const cookieParser = require("cookie-parser");

const server = createServer();

server.express.use(cookieParser());
server.express.use(auth);

server.start(
  {
    playground: null,
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL.split("|")
    }
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
