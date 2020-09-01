import { schema } from 'nexus'
import { core, arg } from 'nexus/components/schema'
import { UserAccessFilter } from './users'
import { can } from '../../permissions/auth'
import { searchBoundary } from '../../utils/location'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  //Fetch single job
  t.crud.job()
  t.list.field('jobs', {
    type: 'Job',
    args: {
      where: schema.arg({ type: 'JobWhereInput' }),
      take: schema.intArg({ nullable: true, default: 10 }),
      orderBy: schema.arg({ type: 'JobOrderByInput', nullable: true }),
    },
    resolve: (parent, args, ctx) => {
      return ctx.db.job.findMany({
        //@ts-ignore
        where: {
          ...args.where,
          status: 'POSTED',
        },
        take: args.take ?? 10,
        //@ts-ignore
        orderBy: { ...(args.orderBy ? args.orderBy : { createdAt: 'desc' }) },
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
      orderBy: schema.arg({ type: 'JobOrderByInput' }),
    },
    resolve: async (parent, args, ctx) => {
      if (!args.location || args.location === '' || args.location === 'fasf') {
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
          //@ts-ignore
          orderBy: args.orderBy ? args.orderBy : { updatedAt: 'desc' },
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

  t.int('jobsGridCount', {
    args: {
      query: schema.stringArg({ nullable: true }),
      status: schema.stringArg({ nullable: true, list: true }),
      branch: schema.stringArg({ nullable: true, list: true }),
    },
    resolve: async (parent, args, ctx) => {
      const queryFilter = args.query
        ? `AND ("Job".title ILIKE '%${args.query}%' OR loc.name ILIKE '%${args.query}%' OR brn.name ILIKE '%${args.query}%' OR "User".name ILIKE '%${args.query}%')`
        : ''
      const statusFilter = args.status
        ? `AND "Job".status in ('${args.status.join(
            `','`,
          )}') AND "Job".status != 'DELETED'`
        : ''

      const branchFilter = args.branch ? `AND brn.id = '${args.branch}'` : ''

      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: {
          branch: { include: { company: true } },
          otherBranches: true,
        },
      })

      const accesibleBranches = [
        user?.branch?.id,
        user?.otherBranches.map((brn) => brn.id),
      ]
        .flat(1)
        .join(`','`)

      let ownerFilter = `brn.id in ('${accesibleBranches}')`
      //Define jobs filter based on access level
      if (await can('READ', 'COMPANY', ctx)) {
        //Gets all the jobs from the company
        // ownerFilter = { branch: { company: { id: user?.branch?.company.id } } }
        ownerFilter = `cmp.id = '${user?.branch?.company?.id}'`
      }

      const result = await ctx.db.$queryRaw(`
      SELECT
      count(*)
      
      FROM "${process.env.DATABASE_SCHEMA}"."Job"
      JOIN "${process.env.DATABASE_SCHEMA}"."User" ON "Job".author = "User".id
      JOIN "${process.env.DATABASE_SCHEMA}"."Location" loc ON "Job".location = loc.id
      JOIN "${process.env.DATABASE_SCHEMA}"."Branch" brn ON "Job".branch = brn.id
      JOIN "${process.env.DATABASE_SCHEMA}"."Company" cmp ON brn.company = cmp.id

      WHERE ${ownerFilter} ${queryFilter} ${statusFilter} ${branchFilter} AND "Job".status != 'DELETED';
      `)

      return result?.[0].count
    },
  })

  t.list.field('jobsGrid', {
    type: 'JobGridItem',
    args: {
      take: schema.intArg({ nullable: true }),
      skip: schema.intArg({ nullable: true }),
      orderBy: schema.stringArg({ nullable: true }),
      query: schema.stringArg({ nullable: true }),
      status: schema.stringArg({ nullable: true, list: true }),
      branch: schema.stringArg({ nullable: true, list: true }),
    },
    resolve: async (parent, args, ctx) => {
      const limit = args.take ? `LIMIT ${args.take}` : ''
      const skip = args.skip ? `OFFSET ${args.skip}` : ''
      const orderBy = args.orderBy ? `ORDER BY ${args.orderBy}` : ''
      const queryFilter = args.query
        ? `AND ("Job".title ILIKE '%${args.query}%' OR loc.name ILIKE '%${args.query}%' OR brn.name ILIKE '%${args.query}%' OR "User".name ILIKE '%${args.query}%' OR "User".email ILIKE '%${args.query}%')`
        : ''
      const statusFilter = args.status
        ? `AND "Job".status in ('${args.status.join(`','`)}')`
        : ''

      const branchFilter = args.branch ? `AND brn.id = '${args.branch}'` : ''

      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: {
          branch: { include: { company: true } },
          otherBranches: true,
        },
      })

      //Get all the branches that the user has access to
      const accesibleBranches = [
        user?.branch?.id,
        user?.otherBranches.map((brn) => brn.id),
      ]
        .flat(1)
        .join(`','`)

      let ownerFilter = `brn.id in ('${accesibleBranches}')`
      //Define jobs filter based on access level
      if (await can('READ', 'COMPANY', ctx)) {
        //Gets all the jobs from the company
        // ownerFilter = { branch: { company: { id: user?.branch?.company.id } } }
        ownerFilter = `cmp.id = '${user?.branch?.company?.id}'`
      }

      const result = await ctx.db.$queryRaw(`
      SELECT
      "Job".id,
      "Job".title,
      "Job".status,
      "User".name as author,
      loc.name as location,
      (SELECT count(*) FROM "${process.env.DATABASE_SCHEMA}"."Application" as app WHERE app.job = "Job".id AND app.status not in ('HIRED','ARCHIVED')) as applications,
      (SELECT count(*) FROM "${process.env.DATABASE_SCHEMA}"."_JobToPerk" as perk WHERE perk."A" = "Job".id) as perks,
      brn.name as branch,
      "Job"."updatedAt",
       "Job"."cronTask",
       "Job"."createdAt",
       "Job"."views"
      FROM "${process.env.DATABASE_SCHEMA}"."Job"
      JOIN "${process.env.DATABASE_SCHEMA}"."User" ON "Job".author = "User".id
      JOIN "${process.env.DATABASE_SCHEMA}"."Location" loc ON "Job".location = loc.id
      JOIN "${process.env.DATABASE_SCHEMA}"."Branch" brn ON "Job".branch = brn.id
      JOIN "${process.env.DATABASE_SCHEMA}"."Company" cmp ON brn.company = cmp.id
      WHERE ${ownerFilter} ${queryFilter} ${statusFilter} ${branchFilter} AND "Job".status != 'DELETED'
      ${orderBy}
      ${limit}
      ${skip};
      `)

      return result
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
