const { forwardTo } = require("prisma-binding");
const { can } = require("../middleware/auth/permissions/utils");

const users = forwardTo("db");
const usersConnection = forwardTo("db");
const me = async (parent, args, ctx, info) => {
  if (!userExists(ctx)) {
    return null;
  }

  const user = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    info
  );

  return (await can("READ", "BRANCH", ctx)) ? user : { ...user, branch: null };
};

module.exports = { queries: { users, me, usersConnection } };
