import { schema } from 'nexus';
schema.objectType({
    name: 'JobCronTask',
    definition(t) {
        t.model.id();
    },
});
