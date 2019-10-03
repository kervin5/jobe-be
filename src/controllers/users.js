const { forwardTo } = require("prisma-binding");
const { can } = require("../lib/auth");

const users = forwardTo("db");
const usersConnection = forwardTo("db");
const me = async (parent, args, ctx, info) => {
  if (!ctx.request.user) {
    return null;
  }

  const user = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    info
  );

  return (await can("READ", "BRANCH", ctx)) ? user : { ...user, branch: null };
};

const candidates = async (parent, args, ctx, info) => {
  return await ctx.db.query.users(
    { ...args, where: { ...args.where, role: { name: "CANDIDATE" } } },
    info
  );
};

const candidatesConnection = async (parent, args, ctx, info) => {
  return await ctx.db.query.usersConnection(
    { ...args, where: { ...args.where, role: { name: "CANDIDATE" } } },
    info
  );
};

module.exports = {
  queries: { users, candidates, me, usersConnection, candidatesConnection }
};
