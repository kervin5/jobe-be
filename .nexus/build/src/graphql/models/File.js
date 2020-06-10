import { schema } from 'nexus';
schema.objectType({
    name: 'File',
    definition(t) {
        t.model.id();
        t.model.createdAt();
        t.model.updatedAt();
        t.model.mimetype();
        t.model.path();
    },
});
schema.objectType({
    name: 'SignedFileUploadRequest',
    definition(t) {
        t.string('signedRequest', { nullable: true });
        t.string('url', { nullable: true });
        t.string('acl', { nullable: true });
    },
});
