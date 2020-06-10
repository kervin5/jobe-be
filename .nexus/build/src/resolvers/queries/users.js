import { arg, intArg } from '@nexus/schema';
import { can } from '../../permissions/auth';
export default (t) => {
    t.field('me', {
        type: 'User',
        nullable: true,
        resolve: async (parent, args, ctx) => {
            if (!ctx.request.user) {
                return null;
            }
            const user = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
            });
            return (user === null || user === void 0 ? void 0 : user.id) ? user : null;
        },
    });
    t.crud.user();
    //Fetch all users
    t.list.field('users', {
        type: 'User',
        args: {
            where: arg({ type: 'UserWhereInput' }),
            skip: intArg(),
            take: intArg(),
        },
        resolve: async (parent, args, ctx) => {
            var _a, _b;
            const requesterData = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
                include: { branch: { include: { company: true } } },
            });
            let usersFilter = {
                branch: { id: (_a = requesterData === null || requesterData === void 0 ? void 0 : requesterData.branch) === null || _a === void 0 ? void 0 : _a.id },
            };
            if (await can('READ', 'COMPANY', ctx)) {
                usersFilter = {
                    branch: { company: { id: (_b = requesterData === null || requesterData === void 0 ? void 0 : requesterData.branch) === null || _b === void 0 ? void 0 : _b.company.id } },
                };
            }
            if (await can('READ', 'USER', ctx)) {
                usersFilter = {};
            }
            return ctx.db.user.findMany({
                where: { ...args.where, ...usersFilter },
                ...(args.take ? { take: args.take, skip: args.skip } : {}),
            });
        },
    });
    t.int('usersConnection', {
        args: {
            where: arg({ type: 'UserWhereInput' }),
        },
        resolve: async (parent, args, ctx) => {
            var _a, _b;
            const user = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
                include: { branch: { include: { company: true } } },
            });
            //Gets jobs created by this user by default;
            let ownerFilter = { id: ctx.request.user.id };
            // let ownerFilter: UserAccessFilter = { author: { id: ctx.request.user.id } }
            //Define jobs filter based on access level
            if (await can('READ', 'COMPANY', ctx)) {
                //Gets all the jobs from the company
                ownerFilter = { branch: { company: { id: (_a = user === null || user === void 0 ? void 0 : user.branch) === null || _a === void 0 ? void 0 : _a.company.id } } };
            }
            else if (await can('READ', 'BRANCH', ctx)) {
                //Gets all the jobs from the branch
                ownerFilter = { branch: { id: (_b = user === null || user === void 0 ? void 0 : user.branch) === null || _b === void 0 ? void 0 : _b.id } };
            }
            return await ctx.db.user.count({
                where: { ...args.where, ...ownerFilter },
            });
        },
    });
    t.list.field('candidates', {
        type: 'User',
        args: {
            where: arg({ type: 'UserWhereInput' }),
            skip: intArg(),
            take: intArg(),
        },
        resolve: async (parent, args, ctx) => {
            var _a, _b;
            const requesterData = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
                include: { branch: { include: { company: true } } },
            });
            let usersFilter = {
                branch: { id: (_a = requesterData === null || requesterData === void 0 ? void 0 : requesterData.branch) === null || _a === void 0 ? void 0 : _a.id },
            };
            if (await can('READ', 'COMPANY', ctx)) {
                usersFilter = {
                    branch: { company: { id: (_b = requesterData === null || requesterData === void 0 ? void 0 : requesterData.branch) === null || _b === void 0 ? void 0 : _b.company.id } },
                };
            }
            if (await can('READ', 'USER', ctx)) {
                usersFilter = {};
            }
            return ctx.db.user.findMany({
                where: { ...args.where, ...usersFilter, role: { name: 'candidate' } },
                ...(args.take ? { take: args.take, skip: args.skip } : {}),
            });
        },
    });
    t.int('candidatesConnection', {
        args: {
            where: arg({ type: 'UserWhereInput' }),
        },
        resolve: async (parent, args, ctx) => {
            var _a;
            const user = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
                include: { branch: { include: { company: true } } },
            });
            //TODO: Refactor hard code name of role
            return await ctx.db.user.count({
                where: {
                    ...args.where,
                    role: { name: 'candidate' },
                    applications: { some: { job: { branch: { id: (_a = user === null || user === void 0 ? void 0 : user.branch) === null || _a === void 0 ? void 0 : _a.id } } } },
                },
            });
        },
    });
};
