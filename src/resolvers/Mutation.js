const bcrypt = require('bcrypt');

const Mutations = {
    async createUser(parent, args, ctx, info) {
        const salt = await bcrypt.genSalt(10);
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args,
                password: await bcrypt.hash(args.password, salt)
            }
        }, info);
        return user;
    },

    async createLocation(parent, args, ctx, info) {
        
        const location = await ctx.db.mutation.createLocation({
            data: {
                ...args
                
            }
        }, info);
        return location;
    },

    async createCategory(parent, args, ctx, info) {
        const category = await ctx.db.mutation.createCategory({
            data: {
                ...args
            }
        }, info);
        return category;
    },

    async createSkill(parent, args, ctx, info) {
        const skill = await ctx.db.mutation.createSkill({
            data: {
                ...args
            }
        }, info);
        return skill;
    },

    async createJob(parent, args, ctx, info) {
        const job = await ctx.db.mutation.createJob({
            data: {
                ...args
            }
        }, info);
        
        return job;
    }
};

module.exports = Mutations;