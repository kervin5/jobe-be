import fetch from 'node-fetch'
import { schema } from 'nexus'

schema.objectType({
  name: 'User',
  definition(t) {
    t.model.id()

    t.model.name()
    t.model.email()
    t.model.branch()
    t.model.jobs({ filtering: true, ordering: true })
    t.model.favorites({ filtering: true })
    t.model.resumes({ filtering: true, ordering: true, pagination: true })
    t.model.role()
    t.model.location()
    t.model.status()
    t.model.applications({ filtering: true })
    t.model.otherBranches()
    t.model.createdAt()
    t.model.createdPerks()
    t.model.phone()
    t.field('eEmpact', {
      type: 'UserEEmpactData',
      async resolve(parent, args, ctx) {
        const res = await fetch('https://api.exactstaff.com/status', {
          method: 'POST',
          body: JSON.stringify({ email: parent.email }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const { user } = await res.json()

        return { ...user }
      },

      nullable: true,
    })
  },
})

export const UserEEmpactData = schema.objectType({
  name: 'UserEEmpactData',
  definition(t) {
    t.string('id', { nullable: true })
    t.int('assignments', { nullable: true })
  },
})

schema.inputObjectType({
  name: 'BranchChangeInput',
  definition: (t) => {
    t.string('id')
    t.boolean('active')
  },
})

schema.unionType({
  name: 'UserResult',
  description: 'Any container type that can be rendered into the feed',
  definition(t) {
    t.members('User', 'GraphqlError')
    t.resolveType((item) => {
      //@ts-ignore
      if (item?.email) {
        return 'User'
      } else {
        return 'GraphqlError'
      }
    })
  },
})
