import { schema } from 'nexus'
import { core, arg } from 'nexus/components/schema'
import { UserAccessFilter } from './users'
import { can } from '../../permissions/auth'
import { searchBoundary } from '../../utils/location'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  //Fetch single job
  t.crud.job()
  // t.field('job', {
  //   type: 'Job',
  //   nullable: true,
  //   args: {
  //     id: schema.stringArg({ required: true }),
  //   },
  //   resolve: async (parent, args, ctx) => {
  //     return ctx.db.job.findOne({ where: { id: args.id } })
  //   },
  // })

  //Fetch list of posted jobs
  // t.crud.jobs({filtering: true, })
  t.list.field('jobs', {
    type: 'Job',
    args: {
      where: schema.arg({ type: 'JobWhereInput' }),
    },
    resolve: (parent, args, ctx) => {
      return ctx.db.job.findMany({
        //@ts-ignore
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
      where: schema.arg({ type: 'JobWhereInput' }),
      take: schema.intArg({ nullable: true }),
      skip: schema.intArg({ nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      //Gets jobs created by this user by default;
      // let ownerFilter: UserAccessFilter = { author: { id: user?.id } }// allow to read only jobs created
      let ownerFilter: UserAccessFilter = { branch: { id: user?.branch?.id } }

      //Define jobs filter based on access level
      if (await can('READ', 'COMPANY', ctx)) {
        //Gets all the jobs from the company

        ownerFilter = { branch: { company: { id: user?.branch?.company.id } } }
      } else if (await can('READ', 'BRANCH', ctx)) {
        //Gets all the jobs from the branch
        ownerFilter = { branch: { id: user?.branch?.id } }
      }

      return ctx.db.job.findMany({
        //@ts-ignore
        where: { ...args.where, ...ownerFilter },
        orderBy: { updatedAt: 'desc' },
        ...(args.take ? { take: args.take, skip: args.skip } : {}),
      })
    },
  })

  t.list.field('searchJobs', {
    type: 'Job',
    args: {
      radius: schema.intArg({ nullable: true, default: 5 }),
      location: schema.stringArg({ nullable: true }),
      query: schema.stringArg(),
      where: schema.arg({ type: 'JobWhereInput' }),
      take: schema.intArg({ nullable: true }),
      skip: schema.intArg({ nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      if (!args.location || args.location === '') {
        return ctx.db.job.findMany({
          where: {
            //@ts-ignore
            OR: [
              ...(args.query
                ? [
                    { title: { contains: args.query?.toLowerCase() } },
                    { description: { contains: args.query?.toLowerCase() } },
                    { title: { contains: args.query?.toUpperCase() } },
                    { description: { contains: args.query?.toUpperCase() } },
                    { title: { contains: titleCase(args.query ?? '') } },
                    { description: { contains: titleCase(args.query ?? '') } },
                    { title: { contains: args.query } },
                    { description: { contains: args.query } },
                  ]
                : []),
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
          ...(args.take ? { take: args.take, skip: args.skip } : {}),
          orderBy: { updatedAt: 'desc' },
        })
      }

      //Get location boundary
      const [leftEdge, bottomEdge, rightEdge, topEdge] = await searchBoundary(
        args.location,
        ctx,
        args.radius ?? 5,
      )

      return await ctx.db.job.findMany({
        where: {
          //@ts-ignore
          AND: [
            {
              OR: [
                ...(args.query
                  ? [
                      { title: { contains: args.query?.toLowerCase() } },
                      { description: { contains: args.query?.toLowerCase() } },
                      { title: { contains: args.query?.toUpperCase() } },
                      { description: { contains: args.query?.toUpperCase() } },
                      { title: { contains: titleCase(args.query ?? '') } },
                      {
                        description: { contains: titleCase(args.query ?? '') },
                      },
                      { title: { contains: args.query } },
                      { description: { contains: args.query } },
                    ]
                  : [{ title: { contains: '' } }]),
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
        ...(args.take ? { take: args.take, skip: args.skip } : {}),
        orderBy: { updatedAt: 'desc' },
      })
    },
  })

  t.int('jobsConnection', {
    args: {
      where: schema.arg({ type: 'JobWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.db.job.count({
        //@ts-ignore
        where: { ...args.where, status: 'POSTED' },
      })
    },
  })

  t.int('protectedJobsConnection', {
    args: {
      where: schema.arg({ type: 'JobWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      //Gets jobs created by this user by default;
      // let ownerFilter: UserAccessFilter = {
      //   author: { id: ctx.request.user.id },
      // }
      let ownerFilter: UserAccessFilter = { branch: { id: user?.branch?.id } }
      //Define jobs filter based on access level
      if (await can('READ', 'COMPANY', ctx)) {
        //Gets all the jobs from the company
        ownerFilter = { branch: { company: { id: user?.branch?.company.id } } }
      } else if (await can('READ', 'BRANCH', ctx)) {
        //Gets all the jobs from the branch
        ownerFilter = { branch: { id: user?.branch?.id } }
      }
      return await ctx.db.job.count({
        //@ts-ignore
        where: { ...args.where, ...ownerFilter },
      })
    },
  })
}

function titleCase(str: string = '') {
  let string = str.toLowerCase().split(' ')
  for (var i = 0; i < string.length; i++) {
    string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1)
  }
  return string.join(' ')
}
