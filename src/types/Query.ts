import { intArg, queryType, stringArg } from '@nexus/schema'
import { getUserId } from '../permissions/auth'

import jobs from '../resolvers/queries/jobs'
import users from '../resolvers/queries/users'
import roles from '../resolvers/queries/roles'
import applications from '../resolvers/queries/applications'
import branches from '../resolvers/queries/branches'
import locations from '../resolvers/queries/locations'
import categories from '../resolvers/queries/categories'
import skills from '../resolvers/queries/skills'
import files from '../resolvers/queries/files'
import terms from '../resolvers/queries/terms'

export const Query = queryType({
  definition(t) {
    jobs(t)
    users(t)
    roles(t)
    applications(t)
    branches(t)
    locations(t)
    categories(t)
    skills(t)
    files(t)
    terms(t)
  },
})
