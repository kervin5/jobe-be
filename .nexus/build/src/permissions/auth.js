import { verify } from 'jsonwebtoken';
export async function can(action, object, ctx) {
    try {
        const user = await ctx.db.user.findOne({
            where: { id: ctx.request.user.id },
            include: {
                role: { include: { permissions: true } },
            },
        });
        return user === null || user === void 0 ? void 0 : user.role.permissions.some((permission) => permission.object === object && permission.actions.includes(action));
    }
    catch (ex) {
        console.log(ex);
        return false;
    }
}
export function getUserId(req) {
    const token = getUserToken(req);
    if (token) {
        const decoded = verify(token, process.env.APP_SECRET);
        return decoded;
    }
}
export function getUserToken(req) {
    var _a;
    const authorization = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) ||
        (req.headers.Authorization
            ? req.headers.Authorization
            : req.headers.authorization || null);
    if (authorization) {
        const token = authorization.replace('Bearer ', '');
        return token;
    }
    else {
        return null;
    }
}
