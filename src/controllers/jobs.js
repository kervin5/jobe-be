const { forwardTo } = require("prisma-binding");
const { searchBoundary } = require("../lib/location");

const job = forwardTo("db");
const jobs = forwardTo("db");
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
        ...args.where
      },
      ...(args.perPage ? { perPage: args.perPage, skip: args.skip } : {}),
      orderBy: "createdAt_DESC"
    },
    info
  );
};

const jobsConnection = async (parent, args, ctx, info) => {
  if (!ctx.request.userExists) {
    return null;
  }

  const user = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    `{
            id
            role {
                permissions (where: { object: "BRANCH" }) {
                    id
                    object
                    actions
                }
            }
            branch {
                id
            }
        }`
  );

  return await ctx.db.query.jobsConnection(
    {
      where: {
        branch: { id: user.branch.id },
        ...(args.status ? { status: args.status } : {}),
        ...(user.role.permissions.length > 0 &&
        user.role.permissions[0].actions.includes("READ")
          ? {}
          : { author: { id: user.id } }),
        ...args.where
      }
    },
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
  queries: { job, jobs, searchJobs, jobsConnection }
};
