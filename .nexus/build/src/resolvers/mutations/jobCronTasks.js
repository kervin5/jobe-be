import { schema } from 'nexus';
export default (t) => {
    //TODO: reimplement crontask procedure
    t.string('schedule', {
        nullable: true,
        args: {
            id: schema.stringArg({ required: true }),
        },
        resolve: async (parent, args, ctx) => {
            return '';
        },
    });
    t.string('unschedule', {
        nullable: true,
        args: {
            id: schema.stringArg({ required: true }),
        },
        resolve: async (parent, args, ctx) => {
            return '';
        },
    });
};
