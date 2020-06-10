import { schema } from 'nexus';
schema.objectType({
    name: 'Favorite',
    definition(t) {
        t.model.id();
        t.model.user();
        t.model.job();
    },
});
