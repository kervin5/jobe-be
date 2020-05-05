import { objectType, inputObjectType } from '@nexus/schema'

export const Job = objectType({
  name: 'Job',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.author()
    t.model.skills()
    t.model.status()
    t.model.location()
    t.model.branch()
    t.model.applications()
    t.model.favorites()
    t.model.description()
    t.model.maxCompensation()
    t.model.minCompensation()
    t.model.updatedAt()
  },
})

export const UpdateJobCustomInput = inputObjectType({
  name: 'UpdateJobCustomInput',
  definition(t) {
    t.string('title')
    t.string('description')
    t.string('disclaimer')
    t.string('compensationType')
    t.string('type')
    t.float('maxCompensation')
    t.float('minCompensation')
    t.string('location')
    t.string('categories', { list: true })
    t.string('skills', { list: true })
    t.field('status', { type: 'JobStatus' })
    t.string('author')
  },
})
