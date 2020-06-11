import { schema } from 'nexus';
schema.objectType({
    name: 'Location',
    definition(t) {
        t.model.id();
        t.model.name();
        t.model.jobs();
        t.model.latitude();
        t.model.longitude();
        t.model.boundary();
    },
});
schema.objectType({
    name: 'MapboxLocation',
    definition(t) {
        t.string('id');
        t.string('name');
    },
});
