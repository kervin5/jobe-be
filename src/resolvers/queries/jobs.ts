import { searchBoundary } from '../../utils/location'
//const { forwardTo } = require("prisma-binding");
import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg, arg, intArg } from '@nexus/schema'
import { UserAccessFilter } from './users'
import { can } from '../../permissions/auth'
import { OrderByArg } from '@prisma/client'

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
      first: intArg({ nullable: true }),
      skip: intArg({ nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.prisma.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      //Gets jobs created by this user by default;
      let ownerFilter: UserAccessFilter = { author: { id: user?.id } }

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
        orderBy: { updatedAt: 'desc' },
        ...(args.first ? { first: args.first, skip: args.skip } : {}),
      })
    },
  })

  t.list.field('searchJobs', {
    type: 'Job',
    args: {
      radius: intArg({ nullable: true, default: 5 }),
      location: stringArg({ nullable: true }),
      query: stringArg(),
      where: arg({ type: 'JobWhereInput' }),
      first: intArg({ nullable: true }),
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
          ...(args.first ? { first: args.first, skip: args.skip } : {}),
          orderBy: { updatedAt: 'desc' },
        })
      }

      //Get location boundary
      const [leftEdge, bottomEdge, rightEdge, topEdge] = await searchBoundary(
        args.location,
        ctx,
        args.radius ?? 5,
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
        ...(args.first ? { first: args.first, skip: args.skip } : {}),
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
      let ownerFilter: UserAccessFilter = {
        author: { id: ctx.request.user.id },
      }

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

function titleCase(str: string = '') {
  let string = str.toLowerCase().split(' ')
  for (var i = 0; i < string.length; i++) {
    string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1)
  }
  return string.join(' ')
}
