const { can } = require("../lib/auth");

const application = async (parent, args, ctx, info) => {
  const application = await ctx.db.query.application(
    { where: { id: args.where.id } },
    `{id status}`
  );
  if (application.status === "NEW") {
    await ctx.db.mutation.updateApplication({
      where: { id: application.id },
      data: { status: "VIEWED" }
    });

    await ctx.db.mutation.createApplicationNote({
      data: {
        content: "VIEWED",
        user: { connect: { id: ctx.request.user.id } },
        application: { connect: { id: args.where.id } },
        type: "STATUS"
      }
    });
  }
  return ctx.db.query.application(args, info);
};

const applications = async (parent, args, ctx, info) => {
  const user = await ctx.db.query.user(
    { where: { id: ctx.request.user.id } },
    `{id branch { id company { id } } }`
  );

  //Gets jobs created by this user by default;
  let ownerFilter = { branch: { id: user.branch.id } };

  //Define jobs filter based on access level
  if (await can("READ", "COMPANY", ctx)) {
    //Gets all the jobs from the company
    ownerFilter = { branch: { company: { id: user.branch.company.id } } };
  }

  // else if (await can("READ", "BRANCH", ctx)) {
  //   //Gets all the jobs from the branch
  //   ownerFilter = { branch: { id: user.branch.id } };
  // }

  return await ctx.db.query.applications(
    {
      ...args,
      where: {
        ...args.where,
        job: {
          ...(args.where && args.where.job ? args.where.job : {}),
          ...ownerFilter
        }
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
  // let ownerFilter = { author: { id: ctx.request.user.id } };
  let ownerFilter = { branch: { id: user.branch.id } };

  //Define jobs filter based on access level
  if (await can("READ", "COMPANY", ctx)) {
    //Gets all the jobs from the company
    ownerFilter = { branch: { company: { id: user.branch.company.id } } };
  }

  // else if (await can("READ", "BRANCH", ctx)) {
  //   //Gets all the jobs from the branch
  //   ownerFilter = { branch: { id: user.branch.id } };
  // }

  return await ctx.db.query.applicationsConnection(
    {
      ...args,
      where: {
        ...args.where,
        job: {
          ...(args.where && args.where.job ? args.where.job : {}),
          ...ownerFilter
        }
      }
    },
    info
  );
};

const applicationNotes = async (parent, args, ctx, info) => {
  return await ctx.db.query.applicationNotes(
    { where: { application: { id: args.id } }, orderBy: "createdAt_DESC" },
    info
  );
};

module.exports = {
  queries: {
    application,
    applications,
    applicationsConnection,
    applicationNotes
  }
};
