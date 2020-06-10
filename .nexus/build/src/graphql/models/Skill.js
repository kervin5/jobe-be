import { schema } from 'nexus';
schema.objectType({
    name: 'Skill',
    definition(t) {
        t.model.id();
        t.model.name();
        t.model.jobs({ filtering: true });
        t.model.users();
        t.model.resumes({ filtering: true });
    },
});
