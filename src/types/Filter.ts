import { objectType, inputObjectType, extendInputType } from '@nexus/schema'

export const OrderByInput = inputObjectType({
  name: 'OrderByInput',
  definition(t) {
    t.string('createdAt', {
      nullable: true,
    })
    t.string('updatedAt', {
      nullable: true,
    })
  },
})
