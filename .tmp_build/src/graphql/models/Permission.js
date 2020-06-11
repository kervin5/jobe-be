import { schema } from 'nexus';
schema.objectType({
    name: 'Permission',
    definition(t) {
        t.model.id();
        t.model.object();
        t.model.actions();
    },
});
