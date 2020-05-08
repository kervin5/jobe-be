import { objectType } from '@nexus/schema'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.branch()
    t.model.jobs({ filtering: true })
    t.model.favorites({ filtering: true })
    t.model.resumes()
    t.model.role()
    t.model.location()
    t.model.applications({ filtering: true })
    t.model.createdAt()
  },
})
