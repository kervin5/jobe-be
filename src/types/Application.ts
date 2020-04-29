import { objectType } from '@nexus/schema'

export const Application = objectType({
  name: 'Application',
  definition(t) {
    t.model.id()
    t.model.applicant()
    t.model.job()
    t.model.status()
  },
})
