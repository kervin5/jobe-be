declare namespace Express {
  interface Request {
    boo?: string
    user?: string
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    foo?: string
    user?: string
  }
}
