import { rule, shield, and, or } from 'nexus-plugin-shield'
import { getUserId, can, IUserCan } from './auth'
// import { Context } from '../context'

const rules = {
  isAuthenticatedUser: rule()((parent, args, context) => {
    const user = getUserId(context.request)

    return Boolean(user && user.id)
  }),
  can: (userPermission: IUserCan) =>
    rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
      return !!(await can(userPermission.action, userPermission.object, ctx))
    }),
}

export const permissions = shield({
  rules: {
    Query: {
      application: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'JOB' }),
        rules.can({ action: 'READ', object: 'APPLICATION' }),
      ),
      applications: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'JOB' }),
        rules.can({ action: 'READ', object: 'APPLICATION' }),
      ),
      applicationsConnection: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'JOB' }),
        rules.can({ action: 'READ', object: 'APPLICATION' }),
      ),
      roles: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'READ', object: 'ROLE' }),
      ),
      protectedJobs: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'JOB' }),
      ),
      protectedJobsConnection: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'JOB' }),
      ),
      user: or(
        rules.isAuthenticatedUser,
        rules.can({ action: 'READ', object: 'USER' }),
        rules.can({ action: 'READ', object: 'COMPANY' }),
        rules.can({ action: 'READ', object: 'BRANCH' }),
      ),
      users: or(
        rules.isAuthenticatedUser,
        rules.can({ action: 'READ', object: 'USER' }),
        rules.can({ action: 'READ', object: 'COMPANY' }),
        rules.can({ action: 'READ', object: 'BRANCH' }),
      ),
      usersConnection: or(
        rules.isAuthenticatedUser,
        rules.can({ action: 'READ', object: 'USER' }),
        rules.can({ action: 'READ', object: 'COMPANY' }),
        rules.can({ action: 'READ', object: 'BRANCH' }),
      ),
      candidates: and(
        rules.isAuthenticatedUser,
        // rules.can({ action: 'CREATE', object: 'JOB' }),
        // or(
        //   rules.can({ action: 'READ', object: 'USER' }),
        //   rules.can({ action: 'READ', object: 'COMPANY' }),
        //   rules.can({ action: 'READ', object: 'BRANCH' }),
        // ),
      ),
      candidatesConnection: and(
        rules.isAuthenticatedUser,
        // rules.can({ action: 'CREATE', object: 'JOB' }),
        // or(
        //   rules.can({ action: 'READ', object: 'USER' }),
        //   rules.can({ action: 'READ', object: 'COMPANY' }),
        //   rules.can({ action: 'READ', object: 'BRANCH' }),
        // ),
      ),

      branches: rules.isAuthenticatedUser,
      getSignedFileUrl: rules.isAuthenticatedUser,
    },
    Mutation: {
      createUser: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'USER' }),
      ),
      deleteUser: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'DELETE', object: 'USER' }),
      ),
      updateUser: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'DELETE', object: 'USER' }),
      ),
      createJob: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'JOB' }),
      ),
      updateJob: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'UPDATE', object: 'JOB' }),
      ),
      createLocation: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'LOCATION' }),
      ),
      createCategory: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'CATEGORY' }),
      ),
      createSkill: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'SKILL' }),
      ),
      createPerk: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'PERK' }),
      ),
      addFavorite: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'FAVORITE' }),
      ),
      deleteFavorite: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'DELETE', object: 'FAVORITE' }),
      ),
      signFileUpload: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'RESUME' }),
      ),
      createApplication: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'APPLICATION' }),
      ),
      createResume: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'RESUME' }),
      ),
      createCompany: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'COMPANY' }),
      ),
      createManyPerks: and(
        rules.isAuthenticatedUser,
        rules.can({ action: 'CREATE', object: 'PERK' }),
      ),
    },
  },
  options: {
    allowExternalErrors: true,
  },
})
