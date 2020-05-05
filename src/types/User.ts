import { objectType } from '@nexus/schema'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.branch()
    t.model.jobs()
    t.model.favorites()
    t.model.resumes()
    t.model.role()
    t.model.location()
    t.model.applications()
    t.model.createdAt()
  },
})
