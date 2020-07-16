import { schema } from 'nexus'

schema.objectType({
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

schema.inputObjectType({
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

schema.objectType({
  name: 'ApplicationGridItem',
  definition(t) {
    t.string('id')
    t.string('jobTitle')
    t.string('jobId')
    t.string('location')
    t.string('branch')
    t.string('owner')
    t.string('status')
    t.date('applied')
    t.date('createdAt')
    t.string('email')
    t.string('phone')
    t.string('eEmpact')
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
