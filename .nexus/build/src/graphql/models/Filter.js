import { schema } from 'nexus';
schema.inputObjectType({
    name: 'OrderByInput',
    definition(t) {
        t.string('createdAt', {
            nullable: true,
        });
        t.string('updatedAt', {
            nullable: true,
        });
    },
});
