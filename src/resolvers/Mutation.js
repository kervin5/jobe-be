const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../startup/db');
const { forwardTo } = require('prisma-binding');

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
    

    async signup(parent, args, ctx, info) {
        console.log(args);
        const salt = await bcrypt.genSalt(10);
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args,
                password: await bcrypt.hash(args.password, salt)
            }
        });

        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

        // 4. Set the cookie with the token
        ctx.response.header('token', token);
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        // console.log(user);
        return token;
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

        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
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
        const jobLocation = args.location.create;
        const locationExists =  await prisma.exists.Location({
            ...jobLocation
        });

        if(locationExists) {
            const existingLocations = await ctx.db.query.locations({
                where: {
                    ...jobLocation
                }
            });
            //Deletes the create mutation and forces connection to existing location if the location already exists
            delete args.location.create;
            args.location.connect = {id: existingLocations[0].id};
        }

        //Connect User to job
        args.author = { connect: {id: ctx.request.user.userId}};
        args.categories = {connect : args.categories.map(category => ({name: category}))};
        args.skills = {connect : args.skills.map(skill => ({name: skill}))};
        args.status = 'DRAFT';

        const job = await ctx.db.mutation.createJob({
            data: {
                ...args
            }
        }, info);
        
        return job;
    },
    async createApplication(parent, args, ctx, info) {
        if (!ctx.request.user.userId) {
            return null;
        }

        args.user = { connect: {id: ctx.request.user.userId}};

        const application = await ctx.db.mutation.createApplication({
            data: {
                ...args
            }
        }, info);
        
        return application;
    },

    async addFavorite(parent, args, ctx, info) {
        if (!ctx.request.user.userId) {
            return null;
        }

        args.user = { connect: {id: ctx.request.user.userId}};

        const result = await ctx.db.mutation.createFavorite({
            data: {
                ...args
            }
        }, info);

        return result;
    },

    async deleteFavorite(parent, args, ctx, info) {
        if(!ctx.request.user.userId) {
            return null;
        }

        return await ctx.db.mutation.deleteFavorite(args, info);

    }
};

module.exports = Mutations;