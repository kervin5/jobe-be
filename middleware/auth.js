const jwt = require('jsonwebtoken');
// const config = require('config');

module.exports = function (req, res, next) {
  
  const token = req.cookies.token || req.headers['authorization'];
  // if (!token) return res.status(401).send({error: 'Access denied.'});
  console.log(req);
  // console.log("token=================================>",token);

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    req.user = decoded; 
  }
  
  catch (ex) {
    //TODO: Handle missing AUTH
    // console.log("error");
    // console.log(token);
    // console.log(Object.keys(req.headers));
  }


  next();
};