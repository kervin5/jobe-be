import fetch from 'node-fetch'
import { schema } from 'nexus'

schema.objectType({
  name: 'User',
  definition(t) {
    t.model.id()

    t.model.name()
    t.model.email()
    t.model.branch()
    t.model.jobs({ filtering: true })
    t.model.favorites({ filtering: true })
    t.model.resumes({ filtering: true, ordering: true, pagination: true })
    t.model.role()
    t.model.location()
    t.model.status()
    t.model.applications({ filtering: true })
    t.model.createdAt()
    t.model.createdPerks()
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
