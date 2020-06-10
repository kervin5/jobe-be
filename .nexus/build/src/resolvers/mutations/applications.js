import { schema } from 'nexus';
import { transport, makeANiceEmail } from '../../utils/mail';
export default (t) => {
    t.field('createApplication', {
        type: 'Application',
        nullable: true,
        args: { job: schema.idArg({ required: true }) },
        resolve: async (parent, args, ctx) => {
            const user = await ctx.db.user.findOne({
                where: { id: ctx.request.user.id },
                include: { resumes: true },
            });
            const job = await ctx.db.job.findOne({
                where: { id: args.job },
                include: { location: true, author: true },
            });
            const application = await ctx.db.application.create({
                data: {
                    ...args,
                    status: 'NEW',
                    resume: {
                        connect: {
                            id: user === null || user === void 0 ? void 0 : user.resumes[0].id,
                        },
                    },
                    job: {
                        connect: {
                            id: args.job,
                        },
                    },
                    user: { connect: { id: ctx.request.user.id } },
                },
            });
            try {
                const mailRes = await transport.sendMail({
                    from: 'noreply@myexactjobs.com',
                    to: user === null || user === void 0 ? void 0 : user.email,
                    subject: `Your application for ${job === null || job === void 0 ? void 0 : job.title} is on its way!`,
                    html: makeANiceEmail(`Congrats ${user === null || user === void 0 ? void 0 : user.name}, \n\nyour application for the position ${job === null || job === void 0 ? void 0 : job.title} at ${job === null || job === void 0 ? void 0 : job.location.name} is on it's way 😁. If you you would like to speed up the proccess please fill out our registration form at \n\n <a href="${process.env.REGISTER_URL}/register?utm_source=myexactjobs&utm_medium=email&utm_campaign=myexactjobs_application&utm_term=My%20Exact%20Jobs&utm_content=My%20Exact%20Jobs%20Application">${process.env.REGISTER_URL}/register/</a>`),
                });
                const mailRecruiterRes = await transport.sendMail({
                    from: 'noreply@myexactjobs.com',
                    to: job === null || job === void 0 ? void 0 : job.author.email,
                    subject: `Your listing for ${job === null || job === void 0 ? void 0 : job.title} has a new application!`,
                    html: makeANiceEmail(`Hi ${job === null || job === void 0 ? void 0 : job.author.name}, \n\nThe candidate ${user === null || user === void 0 ? void 0 : user.name} applied for the position ${job === null || job === void 0 ? void 0 : job.title} at ${job === null || job === void 0 ? void 0 : job.location.name} 😁. Click here to view the resume of the applicant \n\n<a href="${process.env.FRONTEND_URL}/dashboard/applications/${application.id}">${process.env.FRONTEND_URL}/dashboard/applications/${application.id}</a>`),
                });
            }
            catch (ex) {
                console.log(ex);
            }
            return application;
        },
    });
    t.field('updateApplicationStatus', {
        type: 'Application',
        nullable: true,
        args: {
            id: schema.idArg({ required: true }),
            status: schema.arg({ type: 'ApplicationStatus', required: true }),
        },
        resolve: async (parent, args, ctx, info) => {
            try {
                const application = await ctx.db.application.update({
                    where: { id: args.id },
                    data: { status: args.status },
                });
                try {
                    const applicationNote = await ctx.db.applicationNote.create({
                        data: {
                            content: args.status,
                            user: { connect: { id: ctx.request.user.id } },
                            application: { connect: { id: args.id } },
                            type: 'STATUS',
                        },
                    });
                }
                catch (error) {
                    console.log('note not added');
                }
                return application;
            }
            catch (err) {
                return null;
            }
        },
    });
};
