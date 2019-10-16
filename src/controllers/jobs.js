const { forwardTo } = require("prisma-binding");
const { searchBoundary } = require("../lib/location");
const { can } = require("../lib/auth");

const job = forwardTo("db");
const jobs = async (parent, args, ctx, info) => {
  //Default values
  const status = "POSTED";
  return await ctx.db.query.jobs(
    { ...args, where: { ...args.where, status } },
    info
  );
};
const protectedJobs = async (parent, args, ctx, info) => {
  if (!ctx.request.user) {
    return [];
  }

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
  return await ctx.db.query.jobs(
    { ...args, where: { ...args.where, ...ownerFilter } },
    info
  );
};
const searchJobs = async (parent, args, ctx, info) => {
  const [leftEdge, bottomEdge, rightEdge, topEdge] = await searchBoundary(
    args.location,
    ctx,
    args.radius
  );

  return await ctx.db.query.jobs(
    {
      where: {
        OR: [
          { title_contains: args.query.toLowerCase() },
          { description_contains: args.query.toLowerCase() },
          { title_contains: args.query.toUpperCase() },
          { description_contains: args.query.toUpperCase() },
          { title_contains: titleCase(args.query) },
          { description_contains: titleCase(args.query) }
        ],
        location: {
          longitude_lte: rightEdge,
          longitude_gte: leftEdge,
          latitude_lte: topEdge,
          latitude_gte: bottomEdge
        },
        ...args.where,
        status: "POSTED"
      },
      ...(args.perPage ? { perPage: args.perPage, skip: args.skip } : {}),
      orderBy: "createdAt_DESC"
    },
    info
  );
};

const protectedJobsConnection = async (parent, args, ctx, info) => {
  if (!ctx.request.user) {
    return null;
  }

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
  return await ctx.db.query.jobsConnection(
    { ...args, where: { ...args.where, ...ownerFilter } },
    info
  );
};

const jobsConnection = async (parent, args, ctx, info) => {
  return await ctx.db.query.jobsConnection(
    { ...args, where: { ...args.where, status: "POSTED" } },
    info
  );
};

function titleCase(str) {
  let string = str.toLowerCase().split(" ");
  for (var i = 0; i < string.length; i++) {
    string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
  }
  return string.join(" ");
}

module.exports = {
  queries: {
    job,
    jobs,
    protectedJobs,
    searchJobs,
    jobsConnection,
    protectedJobsConnection
  }
};
