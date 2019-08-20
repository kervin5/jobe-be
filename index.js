require('dotenv').config();
const createServer = require('./startup/createServer');
const db = require('./startup/db');
const auth = require('./middleware/auth');

const server = createServer();

// //TODO: Use express middleware to handle cookies (JWT)
// server.express.use((req, res, next) => {
//     let token = null;

//     if(req.headers['authorization']) {
//         token  =  req.headers['authorization'].token ;
//     }

//     if (token) {
//       const { userId } = jwt.verify(token, process.env.APP_SECRET);
//       // put the userId onto the req for future requests to access
//       req.userId = userId;
//     }
//     next();
//   });
server.express.use(auth);


//TODO: Use express middleware to populate current user
server.express.use(async (req, res, next) => {
    // if they aren't logged in, skip this
    if (!req.userId) return next();
    const user = await db.query.user(
      { where: { id: req.userId } },
      '{ id, permissions, email, name }'
    );
    req.user = user;
    next();
});

server.start({
    cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL
    }
}, deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`)
})