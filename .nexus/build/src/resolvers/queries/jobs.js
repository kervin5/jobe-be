import { searchBoundary } from '../../utils/location';
import { schema } from 'nexus';
import { can } from '../../permissions/auth';
export default (t) => {
    //Fetch single job
    t.crud.job();
    //Fetch list of posted jobs
    // t.crud.jobs({filtering: true, })
    t.list.field('jobs', {
        type: 'Job',
        args: {
            where: schema.arg({ type: 'JobWhereInput' }),
        },
        resolve: (parent, args, ctx) => {
            return ctx.db.job.findMany({
                where: {
                    ...args.where,
                    status: 'POSTED',
                },
            });
        },
    });
    t.list.field('protectedJobs', {
        type: 'Job',
        args: {
            where: schema.arg({ type: 'JobWhereInput' }),
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
            let ownerFilter = { author: { id: user === null || user === void 0 ? void 0 : user.id } };
            //Define jobs filter based on access level
            if (await can('READ', 'COMPANY', ctx)) {
                //Gets all the jobs from the company
                ownerFilter = { branch: { company: { id: (_a = user === null || user === void 0 ? void 0 : user.branch) === null || _a === void 0 ? void 0 : _a.company.id } } };
            }
            else if (await can('READ', 'BRANCH', ctx)) {
                //Gets all the jobs from the branch
                ownerFilter = { branch: { id: (_b = user === null || user === void 0 ? void 0 : user.branch) === null || _b === void 0 ? void 0 : _b.id } };
            }
            return ctx.db.job.findMany({
                where: { ...args.where, ...ownerFilter },
                orderBy: { updatedAt: 'desc' },
                ...(args.take ? { take: args.take, skip: args.skip } : {}),
            });
        },
    });
    t.list.field('searchJobs', {
        type: 'Job',
        args: {
            radius: schema.intArg({ nullable: true, default: 5 }),
            location: schema.stringArg({ nullable: true }),
            query: schema.stringArg(),
            where: schema.arg({ type: 'JobWhereInput' }),
            take: schema.intArg({ nullable: true }),
            skip: schema.intArg({ nullable: true }),
        },
        resolve: async (parent, args, ctx) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            if (!args.location || args.location === '') {
                return await ctx.db.job.findMany({
                    where: {
                        OR: [
                            { title: { contains: (_a = args.query) === null || _a === void 0 ? void 0 : _a.toLowerCase() } },
                            { description: { contains: (_b = args.query) === null || _b === void 0 ? void 0 : _b.toLowerCase() } },
                            { title: { contains: (_c = args.query) === null || _c === void 0 ? void 0 : _c.toUpperCase() } },
                            { description: { contains: (_d = args.query) === null || _d === void 0 ? void 0 : _d.toUpperCase() } },
                            { title: { contains: titleCase((_e = args.query) !== null && _e !== void 0 ? _e : '') } },
                            { description: { contains: titleCase((_f = args.query) !== null && _f !== void 0 ? _f : '') } },
                            {
                                location: {
                                    OR: [
                                        { name: { contains: titleCase((_g = args.query) !== null && _g !== void 0 ? _g : '') } },
                                        { name: { contains: (_h = args.query) === null || _h === void 0 ? void 0 : _h.toLowerCase() } },
                                        { name: { contains: (_j = args.query) === null || _j === void 0 ? void 0 : _j.toUpperCase() } },
                                    ],
                                },
                            },
                        ],
                        ...args.where,
                        status: 'POSTED',
                    },
                    ...(args.take ? { take: args.take, skip: args.skip } : {}),
                    orderBy: { updatedAt: 'desc' },
                });
            }
            //Get location boundary
            const [leftEdge, bottomEdge, rightEdge, topEdge] = await searchBoundary(args.location, ctx, (_k = args.radius) !== null && _k !== void 0 ? _k : 5);
            return await ctx.db.job.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { title: { contains: (_l = args.query) === null || _l === void 0 ? void 0 : _l.toLowerCase() } },
                                { description: { contains: (_m = args.query) === null || _m === void 0 ? void 0 : _m.toLowerCase() } },
                                { title: { contains: (_o = args.query) === null || _o === void 0 ? void 0 : _o.toUpperCase() } },
                                { description: { contains: (_p = args.query) === null || _p === void 0 ? void 0 : _p.toUpperCase() } },
                                { title: { contains: titleCase((_q = args.query) !== null && _q !== void 0 ? _q : '') } },
                                { description: { contains: titleCase((_r = args.query) !== null && _r !== void 0 ? _r : '') } },
                            ],
                        },
                        {
                            OR: [
                                {
                                    location: {
                                        longitude: { lte: rightEdge, gte: leftEdge },
                                        latitude: { lte: topEdge, gte: bottomEdge },
                                    },
                                },
                                {
                                    location: {
                                        name: { contains: args.location },
                                    },
                                },
                            ],
                        },
                    ],
                    ...args.where,
                    status: 'POSTED',
                },
                ...(args.take ? { take: args.take, skip: args.skip } : {}),
                orderBy: { updatedAt: 'desc' },
            });
        },
    });
    t.int('jobsConnection', {
        args: {
            where: schema.arg({ type: 'JobWhereInput' }),
        },
        resolve: async (parent, args, ctx) => {
            return ctx.db.job.count({
                where: { ...args.where, status: 'POSTED' },
            });
        },
    });
    t.int('protectedJobsConnection', {
        args: {
            where: schema.arg({ type: 'JobWhereInput' }),
        },
        resolve: async (parent, args, ctx) => {
            var _a, _b;
            const user = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
                include: { branch: { include: { company: true } } },
            });
            //Gets jobs created by this user by default;
            let ownerFilter = {
                author: { id: ctx.request.user.id },
            };
            //Define jobs filter based on access level
            if (await can('READ', 'COMPANY', ctx)) {
                //Gets all the jobs from the company
                ownerFilter = { branch: { company: { id: (_a = user === null || user === void 0 ? void 0 : user.branch) === null || _a === void 0 ? void 0 : _a.company.id } } };
            }
            else if (await can('READ', 'BRANCH', ctx)) {
                //Gets all the jobs from the branch
                ownerFilter = { branch: { id: (_b = user === null || user === void 0 ? void 0 : user.branch) === null || _b === void 0 ? void 0 : _b.id } };
            }
            return await ctx.db.job.count({
                where: { ...args.where, ...ownerFilter },
            });
        },
    });
};
function titleCase(str = '') {
    let string = str.toLowerCase().split(' ');
    for (var i = 0; i < string.length; i++) {
        string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
    }
    return string.join(' ');
}
