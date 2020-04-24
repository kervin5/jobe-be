import { searchBoundary } from '../../utils/location'
//const { forwardTo } = require("prisma-binding");
import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg, arg, intArg, floatArg } from '@nexus/schema'
import { can } from '../../permissions/auth'

interface JobFilter {
  branch?: object
  company?: object
  author?: object
}

export default (t: ObjectDefinitionBlock<'Query'>) => {
  //Fetch single job
  t.crud.job()

  //Fetch list of posted jobs
  // t.crud.jobs({filtering: true, })
  t.list.field('jobs', {
    type: 'Job',
    args: {
      where: arg({ type: 'JobWhereInput' }),
    },
    resolve: (parent, args, ctx) => {
      return ctx.prisma.job.findMany({
        where: {
          ...args.where,
          status: 'POSTED',
        },
      })
    },
  })

  t.list.field('protectedJobs', {
    type: 'Job',
    args: {
      where: arg({ type: 'JobWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.prisma.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      //Gets jobs created by this user by default;
      let ownerFilter: JobFilter = { author: { id: user?.id } }

      //Define jobs filter based on access level
      if (await can('READ', 'COMPANY', ctx)) {
        //Gets all the jobs from the company

        ownerFilter = { branch: { company: { id: user?.branch?.company.id } } }
      } else if (await can('READ', 'BRANCH', ctx)) {
        //Gets all the jobs from the branch
        ownerFilter = { branch: { id: user?.branch?.id } }
      }

      return ctx.prisma.job.findMany({
        where: { ...args.where, ...ownerFilter },
      })
    },
  })

  t.list.field('searchJobs', {
    type: 'Job',
    args: {
      radius: intArg({ nullable: true }),
      location: stringArg({ nullable: true }),
      query: stringArg(),
      where: arg({ type: 'JobWhereInput' }),
      perPage: intArg({ nullable: true }),
      skip: intArg({ nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      if (!args.location || args.location === '') {
        return await ctx.prisma.job.findMany({
          where: {
            OR: [
              { title: { contains: args.query?.toLowerCase() } },
              { description: { contains: args.query?.toLowerCase() } },
              { title: { contains: args.query?.toUpperCase() } },
              { description: { contains: args.query?.toUpperCase() } },
              { title: { contains: titleCase(args.query ?? '') } },
              { description: { contains: titleCase(args.query ?? '') } },
              {
                location: {
                  OR: [
                    { name: { contains: titleCase(args.query ?? '') } },
                    { name: { contains: args.query?.toLowerCase() } },
                    { name: { contains: args.query?.toUpperCase() } },
                  ],
                },
              },
            ],
            ...args.where,
            status: 'POSTED',
          },
          ...(args.perPage ? { perPage: args.perPage, skip: args.skip } : {}),
          orderBy: { updatedAt: 'desc' },
        })
      }

      //Get location boundary
      const [leftEdge, bottomEdge, rightEdge, topEdge] = await searchBoundary(
        args.location,
        ctx,
        args.radius,
      )

      return await ctx.prisma.job.findMany({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: args.query?.toLowerCase() } },
                { description: { contains: args.query?.toLowerCase() } },
                { title: { contains: args.query?.toUpperCase() } },
                { description: { contains: args.query?.toUpperCase() } },
                { title: { contains: titleCase(args.query ?? '') } },
                { description: { contains: titleCase(args.query ?? '') } },
              ],
            },
            {
              OR: [
                {
                  location: {
                    longitude: { lte: rightEdge, gte: leftEdge },
                    latitude: { lte: topEdge, gte: bottomEdge },
                  },
                },
                {
                  location: {
                    name: { contains: args.location },
                  },
                },
              ],
            },
          ],
          ...args.where,
          status: 'POSTED',
        },
        ...(args.perPage ? { perPage: args.perPage, skip: args.skip } : {}),
        orderBy: { updatedAt: 'desc' },
      })
    },
  })

  t.int('jobsConnection', {
    args: {
      where: arg({ type: 'JobWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.prisma.job.count({
        where: { ...args.where, status: 'POSTED' },
      })
    },
  })

  t.int('protectedJobsConnection', {
    args: {
      where: arg({ type: 'JobWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.prisma.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      //Gets jobs created by this user by default;
      let ownerFilter: JobFilter = { author: { id: ctx.request.user.id } }

      //Define jobs filter based on access level
      if (await can('READ', 'COMPANY', ctx)) {
        //Gets all the jobs from the company
        ownerFilter = { branch: { company: { id: user?.branch?.company.id } } }
      } else if (await can('READ', 'BRANCH', ctx)) {
        //Gets all the jobs from the branch
        ownerFilter = { branch: { id: user?.branch?.id } }
      }
      return await ctx.prisma.job.count({
        where: { ...args.where, ...ownerFilter },
      })
    },
  })
}

/*
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
  if (!args.location || args.location === "") {
    return await ctx.db.query.jobs(
      {
        where: {
          OR: [
            { title_contains: args.query.toLowerCase() },
            { description_contains: args.query.toLowerCase() },
            { title_contains: args.query.toUpperCase() },
            { description_contains: args.query.toUpperCase() },
            { title_contains: titleCase(args.query) },
            { description_contains: titleCase(args.query) },
            {
              location: {
                OR: [
                  { name_contains: titleCase(args.query) },
                  { name_contains: args.query.toLowerCase() },
                  { name_contains: args.query.toUpperCase() }
                ]
              }
            }
          ],
          ...args.where,
          status: "POSTED"
        },
        ...(args.perPage ? { perPage: args.perPage, skip: args.skip } : {}),
        orderBy: "updatedAt_DESC"
      },
      info
    );
  }

  const [leftEdge, bottomEdge, rightEdge, topEdge] = await searchBoundary(
    args.location,
    ctx,
    args.radius
  );

  return await ctx.db.query.jobs(
    {
      where: {
        AND: [
          {
            OR: [
              { title_contains: args.query.toLowerCase() },
              { description_contains: args.query.toLowerCase() },
              { title_contains: args.query.toUpperCase() },
              { description_contains: args.query.toUpperCase() },
              { title_contains: titleCase(args.query) },
              { description_contains: titleCase(args.query) }
            ]
          },
          {
            OR: [
              {
                location: {
                  longitude_lte: rightEdge,
                  longitude_gte: leftEdge,
                  latitude_lte: topEdge,
                  latitude_gte: bottomEdge
                }
              },
              {
                location: {
                  name_contains: args.location
                }
              }
            ]
          }
        ],
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

const jobsConnection = (parent, args, ctx, info) => {
  return ctx.db.query.jobsConnection(
    { ...args, where: { ...args.where, status: "POSTED" } },
    info
  );
};



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

*/

function titleCase(str: string = '') {
  let string = str.toLowerCase().split(' ')
  for (var i = 0; i < string.length; i++) {
    string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1)
  }
  return string.join(' ')
}
