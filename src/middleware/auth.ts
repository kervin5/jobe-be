import jwt from 'jsonwebtoken'
import { Request } from 'express'

// const config = require('config');

export default function auth(req: Request, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization ? req.headers.authorization : null)
  // if (!token) return res.status(401).send({error: 'Access denied.'});
  try {
    const key: string = process.env.APP_SECRET ?? ''
    const decoded = jwt.verify(token, key)
    req.user = decoded
  } catch (ex) {
    //TODO: Handle missing AUTH
    // console.log("error");
    // console.log(token);
    // console.log(Object.keys(req.headers));
  }

  next()
}
