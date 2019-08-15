const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  
  const token =
  req.body.token ||
  req.query.token ||
  req.headers['authorization'] ||
  (req.cookies && req.cookies.token);

  if (!token) return res.status(401).send({error: 'Access denied.'});

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded; 
    next();
  }
  catch (ex) {
    res.status(401).send({error: 'Access denied'});
  }
};