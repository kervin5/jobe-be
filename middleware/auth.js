const jwt = require('jsonwebtoken');
// const config = require('config');

module.exports = function (req, res, next) {
  
  const token = req.headers['authorization'];

  // if (!token) return res.status(401).send({error: 'Access denied.'});

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    req.user = decoded; 
  }
  
  catch (ex) {
    // res.status(401).send({error: 'Access denied'});
    // console.log("Bad token");
    // console.log(ex);
    // console.log(req.headers['authorization']);
  }


  next();
};