const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    
    async login(parent, {email, password}, ctx, info){
        // 1. check if there is a user with that email
        const user = await ctx.db.query.user({ where: { email } });
        if (!user) {
        throw new Error(`No such user found for email ${email}`);
        }
        // 2. Check if their password is correct
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
        throw new Error('Invalid Password!');
        }
        // 3. generate the JWT Token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        // 4. Set the cookie with the token
        ctx.response.header('token', token);
        // 5. Return the user
        return token;
    }
    ,
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