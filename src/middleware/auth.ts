import { Token } from '../permissions/auth'
import { Request, Response } from 'express'
import { getUserId } from '../permissions/auth'

// const config = require('config');

declare global {
  namespace Express {
    interface Request {
      user: Token | undefined
    }
  }
}

export default function auth(req: Request, res: Response, next: Function) {
  // if (!token) return res.status(401).send({error: 'Access denied.'});

  try {
    req.user = getUserId(req)
  } catch (ex) {
    console.log({ ex })
    //TODO: Handle missing AUTH
    // console.log("error");
    // console.log(token);
    // console.log(Object.keys(req.headers));
  }

  next()
}
