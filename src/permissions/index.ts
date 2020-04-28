import { rule, shield } from 'graphql-shield'
import { getUserId, can } from '../permissions/auth'
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
  can: (action: string, object: string) =>
    rule(action, object, { cache: 'contextual' })(
      async (parent, args, ctx, info) => bool,
    ),
}

export const permissions = shield(
  {
    Query: {
      /*
    me: rules.isAuthenticatedUser,
    filterPosts: rules.isAuthenticatedUser,
    post: rules.isAuthenticatedUser,*/
      //jobs: rules.allow,
      protectedJobs: rules.isAuthenticatedUser,
      protectedJobsConnection: rules.isAuthenticatedUser,
    },
    Mutation: {
      /*
    createDraft: rules.isAuthenticatedUser,
    deletePost: rules.isPostOwner,
    publish: rules.isPostOwner,*/
    },
  },
  {
    allowExternalErrors: true,
  },
)
