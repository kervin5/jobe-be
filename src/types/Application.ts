import { objectType, inputObjectType } from '@nexus/schema'

export const Application = objectType({
  name: 'Application',
  definition(t) {
    t.model.id()
    t.model.applicant()
    t.model.job()
    t.model.status()
    t.model.updatedAt()
    t.model.createdAt()
  },
})

export const UniqueApplicationInputType = inputObjectType({
  name: 'UniqueApplicationInputType',
  definition(t) {
    t.string('id', { required: true })
  },
})

/*
export const ApplicationCreateInpuType = inputObjectType({
  name: 'ApplicationCreateInpuType',
  definition(t) {
    t.field('job', {
      type: 'string',
    })
  },
})
*/
