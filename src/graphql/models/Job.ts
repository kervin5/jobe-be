import { schema } from 'nexus'

schema.objectType({
  name: 'Job',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.compensationType()
    t.model.author()
    t.model.skills()
    t.model.status()
    t.model.location()
    t.model.branch()
    t.model.applications({ ordering: true })
    t.model.favorites()
    t.model.description()
    t.model.maxCompensation()
    t.model.minCompensation()
    t.model.updatedAt()
    t.model.createdAt()
    t.model.type()
    t.model.disclaimer()
    t.model.categories()
    t.model.cronTask()
    t.model.perks({ filtering: true, ordering: true })
    t.model.views(),
      t.string('permalink', {
        async resolve(parent, args, ctx) {
          const location = await ctx.db.location.findOne({
            where: { id: parent.locationId },
          })

          return formatJobUrl(parent.title, location?.name as string, parent.id)
        },

        nullable: true,
      })
  },
})

schema.inputObjectType({
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
    t.string('perks', { list: true })
    t.field('status', { type: 'JobStatus' })
    t.string('author')
  },
})

schema.extendInputType({
  type: 'JobWhereInput',
  definition: (t) => {
    t.field('status', {
      type: 'JobStatusFilter',
      nullable: true,
    })
  },
})

schema.inputObjectType({
  name: 'JobStatusFilter',
  definition(t) {
    t.field('in', {
      type: 'JobStatus',
      list: true,
      nullable: true,
    })
    t.field('not_in', {
      type: 'JobStatus',
      list: true,
      nullable: true,
    })
    t.field('equals', {
      type: 'JobStatus',
      nullable: true,
    })
  },
})

schema.objectType({
  name: 'JobGridItem',
  definition(t) {
    t.string('id')
    t.string('title')
    t.string('status')
    t.string('author')
    t.string('location')
    t.int('applications')
    t.int('perks')
    t.string('branch')
    t.date('updatedAt')
    t.date('createdAt')
    t.string('cronTask')
    t.int('views')
  },
})

export function formatJobUrl(title: string, location: string, id: string) {
  return `${process.env.FRONTEND_URL}/jobs/${title.replace(
    /[\W_]+/g,
    '-',
  )}-${location.replace(/[\W_]+/g, '-')}-${id}`
}
