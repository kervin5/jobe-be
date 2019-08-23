const userExists = (ctx) => {
    return !!(typeof ctx.request.user !== "undefined" && ctx.request.user.userId);
 };


module.exports = {userExists}