import { mutationType } from '@nexus/schema'

import users from '../resolvers/mutations/users'
import locations from '../resolvers/mutations/locations'
import roles from '../resolvers/mutations/roles'
import categories from '../resolvers/mutations/categories'
import skills from '../resolvers/mutations/skills'
import jobs from '../resolvers/mutations/jobs'
import applications from '../resolvers/mutations/applications'
import applicationNotes from '../resolvers/mutations/applicationNotes'
import favorites from '../resolvers/mutations/favorites'
import files from '../resolvers/mutations/files'
import resumes from '../resolvers/mutations/resumes'
import companies from '../resolvers/mutations/companies'
import jobCronTasks from '../resolvers/mutations/jobCronTasks'

export const Mutation = mutationType({
  definition(t) {
    users(t)
    locations(t)
    roles(t)
    categories(t)
    skills(t)
    jobs(t)
    applications(t)
    applicationNotes(t)
    favorites(t)
    files(t)
    resumes(t)
    companies(t)
    jobCronTasks(t)
  },
})
