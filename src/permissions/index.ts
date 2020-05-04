import { rule, shield, and } from 'graphql-shield'
import { getUserId, can, IUserCan } from '../permissions/auth'
import { Context } from '../context'

const rules = {
  isAuthenticatedUser: rule()((parent, args, context) => {
    const user = getUserId(context.request)

    return Boolean(user && user.id)
  }),
  isPostOwner: rule()(async (parent, { id }, context) => {
    const userId = getUserId(context)
    const author = await context.prisma.post
      .findOne({
        where: {
          id: Number(id),
        },
      })
      .author()
    return userId === author.id
  }),
  can: (userPermission: IUserCan) =>
    rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
      return !!(await can(userPermission.action, userPermission.object, ctx))
    }),
}

export const permissions = shield(
  {
    Query: {
      me: rules.isAuthenticatedUser,
      /*
    me: rules.isAuthenticatedUser,
    filterPosts: rules.isAuthenticatedUser,
    post: rules.isAuthenticatedUser,*/
      //jobs: rules.allow,
      roles: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'READ', object: 'ROLE' }),
      ),
      protectedJobs: rules.isAuthenticatedUser,
      protectedJobsConnection: rules.isAuthenticatedUser,
      user: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'READ', object: 'USER' }),
      ),
      users: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'READ', object: 'USER' }),
      ),
      usersConnection: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'READ', object: 'USER' }),
      ),
      candidates: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'JOB' }),
      ),
      candidatesConnection: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'JOB' }),
      ),
      branches: rules.isAuthenticatedUser,
      getSignedFileUrl: rules.isAuthenticatedUser,
    },
    Mutation: {
      /*
    createDraft: rules.isAuthenticatedUser,
    deletePost: rules.isPostOwner,
    publish: rules.isPostOwner,*/
      createJob: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'JOB' }),
      ),
    },
  },
  {
    allowExternalErrors: true,
  },
)
