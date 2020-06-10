import { schema } from 'nexus';
export default (t) => {
    t.id('addFavorite', {
        nullable: true,
        args: {
            job: schema.idArg({ required: true }),
        },
        resolve: async (parent, args, ctx) => {
            const favorites = await ctx.db.favorite.findMany({
                where: { user: { id: ctx.request.user.id }, job: { id: args.job } },
            });
            const user = { connect: { id: ctx.request.user.id } };
            const job = { connect: { id: args.job } };
            try {
                if (favorites.length <= 0) {
                    await ctx.db.favorite.create({
                        data: {
                            user,
                            job,
                        },
                    });
                }
                return args.job;
            }
            catch (err) {
                return null;
            }
        },
    });
    t.id('deleteFavorite', {
        nullable: true,
        args: {
            job: schema.idArg({ required: true }),
        },
        resolve: async (parent, args, ctx) => {
            try {
                const favorites = await ctx.db.favorite.findMany({
                    where: { user: { id: ctx.request.user.id }, job: { id: args.job } },
                });
                if (favorites.length > 0) {
                    await ctx.db.favorite.delete({
                        where: {
                            id: favorites[0].id,
                        },
                    });
                }
                return args.job;
            }
            catch (err) {
                console.log(err);
                return null;
            }
        },
    });
};
