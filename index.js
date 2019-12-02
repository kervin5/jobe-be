require("dotenv").config();
const createServer = require("./startup/createServer");
const db = require("./startup/db");
const auth = require("./src/middleware/auth/auth");
const cookieParser = require("cookie-parser");
const { restartJobAutoUpdate } = require("./src/lib/schedule");
// const Sentry = require("@sentry/node");
// Sentry.init({ dsn: process.env.SENTRY_DSN });
// console.log(db.query);
// console.log(db.query);
const jobsRestart = restartJobAutoUpdate(db);

jobsRestart
  .then(data => console.log("jobs scheduled", data))
  .catch(data => {
    console.log("scheduling failed");
  });

const server = createServer();

// The request handler must be the first middleware on the app
// server.express.use(Sentry.Handlers.requestHandler());

server.express.use(cookieParser());
server.express.use(auth);
// server.express.use(Sentry.Handlers.errorHandler());

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
