const userExists = (ctx) => {
    return !!(typeof ctx.request.user !== "undefined" && ctx.request.user.id);
 };


module.exports = {userExists}