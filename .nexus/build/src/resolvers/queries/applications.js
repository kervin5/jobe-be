import { schema } from 'nexus';
import { can } from '../../permissions/auth';
export default (t) => {
    // t.crud.application()
    t.field('application', {
        type: 'Application',
        nullable: true,
        args: {
            where: schema.arg({ type: 'UniqueApplicationInputType', required: true }),
        },
        resolve: async (parent, args, ctx) => {
            var _a;
            const applicationId = ((_a = args.where) === null || _a === void 0 ? void 0 : _a.id) ? args.where.id : '';
            const application = await ctx.db.application.findOne({
                where: { id: applicationId },
            });
            if ((application === null || application === void 0 ? void 0 : application.status) === 'NEW') {
                await ctx.db.application.update({
                    where: { id: application.id },
                    data: { status: 'VIEWED' },
                });
                await ctx.db.applicationNote.create({
                    data: {
                        content: 'VIEWED',
                        user: { connect: { id: ctx.request.user.id } },
                        application: { connect: { id: args.where.id } },
                        type: 'STATUS',
                    },
                });
            }
            return ctx.db.application.findOne(args);
        },
    });
    t.list.field('applications', {
        type: 'Application',
        args: {
            where: schema.arg({ type: 'ApplicationWhereInput' }),
            take: schema.intArg({ nullable: true }),
            skip: schema.intArg({ nullable: true }),
        },
        resolve: async (parent, args, ctx) => {
            var _a, _b;
            const user = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
                include: { branch: { include: { company: true } } },
            });
            //Gets jobs created by this user by default;
            let ownerFilter = { branch: { id: (_a = user === null || user === void 0 ? void 0 : user.branch) === null || _a === void 0 ? void 0 : _a.id } };
            //Define jobs filter based on access level
            if (await can('READ', 'COMPANY', ctx)) {
                //Gets all the jobs from the company
                ownerFilter = { branch: { company: { id: (_b = user === null || user === void 0 ? void 0 : user.branch) === null || _b === void 0 ? void 0 : _b.company.id } } };
            }
            return await ctx.db.application.findMany({
                ...args,
                where: {
                    ...args.where,
                    job: {
                        ...(args.where && args.where.job ? args.where.job : {}),
                        ...ownerFilter,
                    },
                },
            });
        },
    });
    t.int('applicationsConnection', {
        args: {
            where: schema.arg({ type: 'ApplicationWhereInput' }),
        },
        resolve: async (parent, args, ctx) => {
            var _a, _b;
            const user = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
                include: { branch: { include: { company: true } } },
            });
            //Gets jobs created by this user by default;
            // let ownerFilter = { author: { id: ctx.request.user.id } };
            let ownerFilter = { branch: { id: (_a = user === null || user === void 0 ? void 0 : user.branch) === null || _a === void 0 ? void 0 : _a.id } };
            //Define jobs filter based on access level
            if (await can('READ', 'COMPANY', ctx)) {
                //Gets all the jobs from the company
                ownerFilter = { branch: { company: { id: (_b = user === null || user === void 0 ? void 0 : user.branch) === null || _b === void 0 ? void 0 : _b.company.id } } };
            }
            // else if (await can("READ", "BRANCH", ctx)) {
            //   //Gets all the jobs from the branch
            //   ownerFilter = { branch: { id: user.branch.id } };
            // }
            return ctx.db.application.count({
                ...args,
                where: {
                    ...args.where,
                    job: {
                        ...(args.where && args.where.job ? args.where.job : {}),
                        ...ownerFilter,
                    },
                },
            });
        },
    });
    t.list.field('applicationNotes', {
        type: 'ApplicationNote',
        args: { id: schema.stringArg() },
        resolve: async (parent, args, ctx) => {
            return ctx.db.applicationNote.findMany({
                where: { application: { id: args.id } },
                orderBy: { createdAt: 'desc' },
            });
        },
    });
};
