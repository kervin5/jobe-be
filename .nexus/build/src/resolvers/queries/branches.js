import { schema } from 'nexus';
export default (t) => {
    t.list.field('branches', {
        type: 'Branch',
        args: {
            where: schema.arg({ type: 'BranchWhereInput' }),
        },
        resolve: async (parent, args, ctx) => {
            var _a;
            const user = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
                include: { branch: { include: { company: true } } },
            });
            return ctx.db.branch.findMany({
                where: { company: { id: (_a = user === null || user === void 0 ? void 0 : user.branch) === null || _a === void 0 ? void 0 : _a.company.id } },
            });
        },
    });
};
