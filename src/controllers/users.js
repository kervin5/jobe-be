const { forwardTo } = require("prisma-binding");
const { can } = require("../lib/auth");

const users = async (parent, args, ctx, info) => {
  const requesterData = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    `{ id branch { id company { id } } }`
  );
  let usersFilter = { branch: { id: requesterData.branch.id } };

  if (await can("READ", "COMPANY", ctx)) {
    usersFilter = {
      branch: { company: { id: requesterData.branch.company.id } }
    };
  }

  if (await can("READ", "USER", ctx)) {
    usersFilter = {};
  }

  const users = await ctx.db.query.users(
    {
      ...args,
      where: { ...args.where, ...usersFilter }
    },
    info
  );
  return users;
};

const usersConnection = async (parent, args, ctx, info) => {
  const requesterData = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    `{ id branch { id company { id } } }`
  );

  let usersFilter = { branch: { id: requesterData.branch.id } };

  if (await can("READ", "COMPANY", ctx)) {
    usersFilter = {
      branch: { company: { id: requesterData.branch.company.id } }
    };
  }

  if (await can("READ", "USER", ctx)) {
    usersFilter = {};
  }

  const users = await ctx.db.query.usersConnection(
    {
      ...args,
      where: { ...args.where, ...usersFilter }
    },
    info
  );

  return users;
};
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

const user = async (parent, args, ctx, info) => {
  if (!ctx.request.user) {
    return null;
  }

  return ctx.db.query.user({ where: { id: args.where.id } }, info);
};

const candidates = async (parent, args, ctx, info) => {
  const user = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    `{id branch { id }}`
  );

  return await ctx.db.query.users(
    {
      ...args,
      where: {
        ...args.where,
        role: { name: "candidate" },
        applications_some: { job: { branch: { id: user.branch.id } } }
      }
    },
    info
  );
};

const candidatesConnection = async (parent, args, ctx, info) => {
  const user = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    `{id branch { id }}`
  );
  return await ctx.db.query.usersConnection(
    {
      ...args,
      where: {
        ...args.where,
        role: { name: "candidate" },
        applications_some: { job: { branch: { id: user.branch.id } } }
      }
    },
    info
  );
};

module.exports = {
  queries: {
    users,
    user,
    candidates,
    me,
    usersConnection,
    candidatesConnection
  }
};
