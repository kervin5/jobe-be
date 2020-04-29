import { intArg, queryType, stringArg } from '@nexus/schema'
import { getUserId } from '../permissions/auth'

import jobs from '../resolvers/queries/jobs'
import users from '../resolvers/queries/users'
import roles from '../resolvers/queries/roles'
import applications from '../resolvers/queries/applications'

export const Query = queryType({
  definition(t) {
    jobs(t)
    users(t)
    roles(t)
    applications(t)
    /*
    t.field('me', {
      type: 'User',
      nullable: true,
      resolve: (parent, args, ctx) => {
        const userId = getUserId(ctx)
        return ctx.prisma.user.findOne({
          where: {
            id: Number(userId),
          },
        })
      },
    })

    t.list.field('feed', {
      type: 'Post',
      resolve: (parent, args, ctx) => {
        return ctx.prisma.post.findMany({
          where: { published: true },
        })
      },
    })

    t.list.field('filterPosts', {
      type: 'Post',
      args: {
        searchString: stringArg({ nullable: true }),
      },
      resolve: (parent, { searchString }, ctx) => {
        return ctx.prisma.post.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: searchString,
                },
              },
              {
                content: {
                  contains: searchString,
                },
              },
            ],
          },
        })
      },
    })

    t.field('job', {
      type: 'Job',
      nullable: true,
      args: { id: stringArg() },
      resolve: (parent, { id }, ctx) => {
        return ctx.prisma.job.findOne({
          where: {
            id: String(id),
          },
        })
      },
    })

  t.crud.job()
  t.crud.jobs()
  t.crud.categories()
  t.crud.user()
  t.crud.users()
  */
    // t.crud.skills()
  },
})
