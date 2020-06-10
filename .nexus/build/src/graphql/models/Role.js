import { schema } from 'nexus';
schema.objectType({
    name: 'Role',
    definition(t) {
        t.model.id();
        t.model.name();
        t.model.permissions();
        t.model.users();
    },
});
schema.inputObjectType({
    name: 'RolePermissionsInputType',
    definition(t) {
        t.string('object', { required: true }), t.string('actions', { list: true });
    },
});
