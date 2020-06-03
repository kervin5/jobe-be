import {
  objectType,
  inputObjectType,
  extendInputType,
  arg,
} from '@nexus/schema'

export const Application = objectType({
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

export const UniqueApplicationInputType = inputObjectType({
  name: 'UniqueApplicationInputType',
  definition(t) {
    t.string('id', { required: true })
  },
})

export const ApplicationWherInputWithStatus = extendInputType({
  type: 'ApplicationWhereInput',
  definition: (t) => {
    t.field('status', {
      type: 'ApplicationStatusFilter',
      nullable: true,
    })
  },
})

export const ApplicationStatusFilter = inputObjectType({
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
