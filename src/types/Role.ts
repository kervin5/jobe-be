import { objectType, inputObjectType } from '@nexus/schema'

export const Role = objectType({
  name: 'Role',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.permissions()
  },
})

export const RolePermissionsInputType = inputObjectType({
  name: 'RolePermissionsInputType',
  definition(t) {
    t.string('object', { required: true }), t.string('actions', { list: true })
  },
})
