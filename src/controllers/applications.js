const { forwardTo } = require("prisma-binding");
const { searchBoundary } = require("../lib/location");
const { can } = require("../lib/auth");

const application = forwardTo("db");

const applications = async (parent, args, ctx, info) => {
  const user = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    `{id branch { id company { id } } }`
  );

  //Gets jobs created by this user by default;
  let ownerFilter = { author: { id: ctx.request.user.id } };

  //Define jobs filter based on access level
  if (await can("READ", "COMPANY", ctx)) {
    //Gets all the jobs from the company
    ownerFilter = { branch: { company: { id: user.branch.company.id } } };
  } else if (await can("READ", "BRANCH", ctx)) {
    //Gets all the jobs from the branch
    ownerFilter = { branch: { id: user.branch.id } };
  }

  return await ctx.db.query.applications(
    {
      ...args,
      where: {
        ...args.where,
        job: { ...(args.where.job ? args.where.job : {}), ...ownerFilter }
      }
    },
    info
  );
};

const applicationsConnection = async (parent, args, ctx, info) => {
  const user = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    `{id branch { id company { id } } }`
  );

  //Gets jobs created by this user by default;
  let ownerFilter = { author: { id: ctx.request.user.id } };

  //Define jobs filter based on access level
  if (await can("READ", "COMPANY", ctx)) {
    //Gets all the jobs from the company
    ownerFilter = { branch: { company: { id: user.branch.company.id } } };
  } else if (await can("READ", "BRANCH", ctx)) {
    //Gets all the jobs from the branch
    ownerFilter = { branch: { id: user.branch.id } };
  }

  return await ctx.db.query.applicationsConnection(
    {
      ...args,
      where: {
        ...args.where,
        job: { ...(args.where.job ? args.where.job : {}), ...ownerFilter }
      }
    },
    info
  );
};

module.exports = {
  queries: {
    application,
    applications,
    applicationsConnection
  }
};
