import { schema } from 'nexus'

export const Application = schema.objectType({
  name: 'Application',
  definition(t) {
    t.model.id()
    t.model.user()
    t.model.job()
    t.model.status()
    t.model.updatedAt()
    t.model.createdAt()
    t.model.resume()
    t.model.notes()
  },
})

export const UniqueApplicationInputType = schema.inputObjectType({
  name: 'UniqueApplicationInputType',
  definition(t) {
    t.string('id', { required: true })
  },
})

schema.extendInputType({
  type: 'ApplicationWhereInput',
  definition: (t) => {
    t.field('status', {
      type: 'ApplicationStatusFilter',
      nullable: true,
    })
  },
})

schema.inputObjectType({
  name: 'ApplicationStatusFilter',
  definition(t) {
    t.field('in', {
      type: 'ApplicationStatus',
      list: true,
      nullable: true,
    })
    t.field('not_in', {
      type: 'ApplicationStatus',
      list: true,
      nullable: true,
    })
    t.field('equals', {
      type: 'ApplicationStatus',
      nullable: true,
    })
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
