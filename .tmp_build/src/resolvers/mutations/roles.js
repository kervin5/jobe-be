import { schema } from 'nexus';
export default (t) => {
    t.field('createRole', {
        type: 'Role',
        nullable: true,
        args: {
            name: schema.stringArg({ required: true }),
            permissions: schema.arg({
                type: 'RolePermissionsInputType',
                list: true,
                required: true,
            }),
        },
        resolve: async (parent, args, ctx) => {
            var _a;
            const rolePermissions = (_a = args.permissions) === null || _a === void 0 ? void 0 : _a.map((permission) => ({
                object: permission.object,
                actions: { set: permission.actions },
            }));
            return await ctx.db.role.create({
                data: {
                    name: args.name,
                    permissions: {
                        create: rolePermissions,
                    },
                },
            });
        },
    });
    t.field('updateRole', {
        type: 'Role',
        nullable: true,
        args: {
            id: schema.idArg({ required: true }),
            name: schema.stringArg(),
            permissions: schema.arg({ type: 'RolePermissionsInputType', list: true }),
        },
        resolve: async (parent, args, ctx) => {
            var _a;
            const role = await ctx.db.role.findOne({
                where: { id: args.id },
                include: { permissions: true },
            });
            return ctx.db.role.update({
                data: {
                    name: args.name || (role === null || role === void 0 ? void 0 : role.name),
                    permissions: {
                        delete: role === null || role === void 0 ? void 0 : role.permissions.map((permission) => ({
                            id: permission.id,
                        })),
                        create: (_a = args.permissions) === null || _a === void 0 ? void 0 : _a.map((permission) => ({
                            object: permission.object,
                            actions: { set: permission.actions },
                        })),
                    },
                },
                where: { id: args.id },
            });
        },
    });
};
