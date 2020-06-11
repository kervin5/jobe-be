import { core } from 'nexus/components/schema'
import { schema } from 'nexus'
import { can } from '../../permissions/auth'

export interface UserAccessFilter {
  branch?: object
  company?: object
  author?: object
  id?: string
}

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.field('me', {
    type: 'User',
    nullable: true,
    resolve: async (parent, args, ctx) => {
      if (!ctx.request.user) {
        return null
      }
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
      })

      return user?.id ? user : null
    },
  })

  t.crud.user()
  //Fetch all users
  t.list.field('users', {
    type: 'User',
    args: {
      where: schema.arg({ type: 'UserWhereInput' }),
      skip: schema.intArg(),
      take: schema.intArg(),
    },
    resolve: async (parent, args, ctx) => {
      const requesterData = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      let usersFilter: UserAccessFilter = {
        branch: { id: requesterData?.branch?.id },
      }

      if (await can('READ', 'COMPANY', ctx)) {
        usersFilter = {
          branch: { company: { id: requesterData?.branch?.company.id } },
        }
      }

      if (await can('READ', 'USER', ctx)) {
        usersFilter = {}
      }

      return ctx.db.user.findMany({
        where: { ...args.where, ...usersFilter },
        ...(args.take ? { take: args.take, skip: args.skip } : {}),
      })
    },
  })

  t.int('usersConnection', {
    args: {
      where: schema.arg({ type: 'UserWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      //Gets jobs created by this user by default;
      let ownerFilter: UserAccessFilter = { id: ctx.request.user.id }
      // let ownerFilter: UserAccessFilter = { author: { id: ctx.request.user.id } }

      //Define jobs filter based on access level
      if (await can('READ', 'COMPANY', ctx)) {
        //Gets all the jobs from the company
        ownerFilter = { branch: { company: { id: user?.branch?.company.id } } }
      } else if (await can('READ', 'BRANCH', ctx)) {
        //Gets all the jobs from the branch
        ownerFilter = { branch: { id: user?.branch?.id } }
      }
      return await ctx.db.user.count({
        where: { ...args.where, ...ownerFilter },
      })
    },
  })

  t.list.field('candidates', {
    type: 'User',
    args: {
      where: schema.arg({ type: 'UserWhereInput' }),
      skip: schema.intArg(),
      take: schema.intArg(),
    },
    resolve: async (parent, args, ctx) => {
      const requesterData = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      let usersFilter: UserAccessFilter = {
        branch: { id: requesterData?.branch?.id },
      }

      if (await can('READ', 'COMPANY', ctx)) {
        usersFilter = {
          branch: { company: { id: requesterData?.branch?.company.id } },
        }
      }

      if (await can('READ', 'USER', ctx)) {
        usersFilter = {}
      }

      return ctx.db.user.findMany({
        where: { ...args.where, ...usersFilter, role: { name: 'candidate' } },

        ...(args.take ? { take: args.take, skip: args.skip } : {}),
      })
    },
  })

  t.int('candidatesConnection', {
    args: {
      where: schema.arg({ type: 'UserWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      //TODO: Refactor hard code name of role
      return await ctx.db.user.count({
        where: {
          ...args.where,
          role: { name: 'candidate' },
          applications: { some: { job: { branch: { id: user?.branch?.id } } } },
        },
      })
    },
  })
}
