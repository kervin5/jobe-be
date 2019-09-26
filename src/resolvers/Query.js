const { forwardTo } = require("prisma-binding");
const request = require("../lib/request");
const jwt = require("jsonwebtoken");
const { can } = require("../../middleware/auth/permissions/utils");
const { searchBoundary } = require("../lib/location");
const { sign_s3_read } = require("../lib/aws");
const { shuffleArray } = require("../lib/utils");

const Query = {
  // async locations(parent, args, ctx, info) {
  //     const locations = await ctx.db.query.locations();
  //     return locations;
  // }
  jobs: forwardTo("db"),
  job: forwardTo("db"),
  usersConnection: forwardTo("db"),
  async searchJobs(parent, args, ctx, info) {
    const [leftEdge, bottomEdge, rightEdge, topEdge] = await searchBoundary(
      args.location,
      ctx,
      args.radius
    );
    return await ctx.db.query.jobs(
      {
        where: {
          OR: [
            { title_contains: args.query },
            { description_contains: args.query }
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
  },
  async jobsConnection(parent, args, ctx, info) {
    if (!userExists(ctx)) {
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
  },
  users: forwardTo("db"),
  roles: forwardTo("db"),
  async branches(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    const user = await ctx.db.query.user(
      { where: { id: ctx.request.user.id } },
      `{ 
            id
            branch {
                id
                company {
                    id
                }
            }
         }`
    );

    const branches = await ctx.db.query.branches({
      where: { company: { id: user.branch.company.id } }
    });

    return branches;
  },
  async me(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    const user = await ctx.db.query.user(
      { where: { id: ctx.request.user.id } },
      info
    );

    return (await can("READ", "BRANCH", ctx))
      ? user
      : { ...user, branch: null };
    return user;
  },
  locations: forwardTo("db"),
  location: forwardTo("db"),
  categories: forwardTo("db"),
  category: forwardTo("db"),
  skills: forwardTo("db"),
  async getSignedFileUrl(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }
    const [file] = await ctx.db.query.files({
      where: { path_ends_with: args.AWSUrl }
    });

    if (file) {
      return await sign_s3_read(file.path);
    }
    return null;
  },
  async applicationsConnection(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }

    return await ctx.db.query.applicationsConnection(
      { where: { job: { author: { id: ctx.request.user.id } } } },
      info
    );
  },
  async popularTerms(parent, args, ctx, info) {
    console.log("hit");
    let categories = await ctx.db.query.categories(
      { where: { jobs_some: { status: "POSTED" } } },
      `{
            id
            name
            jobs {
                id
            }
        }`
    );

    let locations = await ctx.db.query.locations(
      { where: { jobs_some: { status: "POSTED" } } },
      `{
              id
              name
              jobs {
                  id
              }
          }`
    );

    categories.sort((a, b) => (a.jobs.length > b.jobs.length ? -1 : 1));
    locations.sort((a, b) => (a.jobs.length > b.jobs.length ? -1 : 1));

    const terms = [
      ...categories
        .map(category => ({
          label: category.name,
          type: "category",
          id: category.id
        }))
        .slice(0, 3),
      ...locations
        .map(location => ({
          label: location.name,
          type: "location",
          id: location.id
        }))
        .slice(0, 3)
    ];

    shuffleArray(terms);

    return terms;
  }
};

const userExists = ctx => {
  return !!(typeof ctx.request.user !== "undefined" && ctx.request.user.id);
};

module.exports = Query;
