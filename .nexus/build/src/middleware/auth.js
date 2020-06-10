import { getUserId } from '../permissions/auth';
export default function auth(req, res, next) {
    // if (!token) return res.status(401).send({error: 'Access denied.'});
    try {
        req.user = getUserId(req);
    }
    catch (ex) {
        // console.log({ ex })
        //TODO: Handle missing AUTH
        // console.log("error");
        // console.log(token);
        // console.log(Object.keys(req.headers));
    }
    next();
}
