import { schema } from 'nexus'
import { core } from 'nexus/components/schema'
import { UserAccessFilter } from './users'
import { can } from '../../permissions/auth'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  // t.crud.application()

  t.field('application', {
    type: 'Application',
    nullable: true,
    args: {
      where: schema.arg({ type: 'UniqueApplicationInputType', required: true }),
    },
    resolve: async (parent, args, ctx) => {
      const applicationId = args.where?.id ? args.where.id : ''

      const application = await ctx.db.application.findOne({
        where: { id: applicationId },
      })

      if (application?.status === 'NEW') {
        await ctx.db.application.update({
          where: { id: application.id },
          data: { status: 'VIEWED' },
        })

        await ctx.db.applicationNote.create({
          data: {
            content: 'VIEWED',
            user: { connect: { id: ctx.request.user.id } },
            application: { connect: { id: args.where.id } },
            type: 'STATUS',
          },
        })
      }
      return ctx.db.application.findOne(args)
    },
  })

  t.list.field('applications', {
    type: 'Application',
    args: {
      where: schema.arg({ type: 'ApplicationWhereInput' }),
      take: schema.intArg({ nullable: true }),
      skip: schema.intArg({ nullable: true }),
      orderBy: schema.arg({ type: 'ApplicationOrderByInput' }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      //Gets jobs created by this user by default;
      let ownerFilter: UserAccessFilter = { branch: { id: user?.branch?.id } }

      //Define jobs filter based on access level
      if (await can('READ', 'COMPANY', ctx)) {
        //Gets all the jobs from the company
        ownerFilter = { branch: { company: { id: user?.branch?.company.id } } }
      }

      return await ctx.db.application.findMany({
        ...args,
        where: {
          ...args.where,
          //@ts-ignore
          job: {
            ...(args.where && args.where.job ? args.where.job : {}),
            ...ownerFilter,
          },
        },
        ...(args.orderBy ? { orderBy: args.orderBy } : {}),
      })
    },
  })

  t.int('applicationsConnection', {
    args: {
      where: schema.arg({ type: 'ApplicationWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      //Gets jobs created by this user by default;
      // let ownerFilter = { author: { id: ctx.request.user.id } };
      let ownerFilter: UserAccessFilter = { branch: { id: user?.branch?.id } }

      //Define jobs filter based on access level
      if (await can('READ', 'COMPANY', ctx)) {
        //Gets all the jobs from the company
        ownerFilter = { branch: { company: { id: user?.branch?.company.id } } }
      }

      // else if (await can("READ", "BRANCH", ctx)) {
      //   //Gets all the jobs from the branch
      //   ownerFilter = { branch: { id: user.branch.id } };
      // }
      return ctx.db.application.count({
        ...args,
        where: {
          ...args.where,
          //@ts-ignore
          job: {
            ...(args.where && args.where.job ? args.where.job : {}),
            ...ownerFilter,
          },
        },
      })
    },
  })

  t.list.field('applicationNotes', {
    type: 'ApplicationNote',
    args: { id: schema.stringArg() },
    resolve: async (parent, args, ctx) => {
      return ctx.db.applicationNote.findMany({
        //@ts-ignore
        where: { application: { id: args.id } },
        orderBy: { createdAt: 'desc' },
      })
    },
  })
}
