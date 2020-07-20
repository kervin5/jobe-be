import { schema } from 'nexus'
import { core } from 'nexus/components/schema'
import { transport, makeANiceEmail } from '../../utils/mail'
import appText from '../../../lang/appText'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createApplication', {
    type: 'Application',
    nullable: true,
    args: { job: schema.idArg({ required: true }) },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { resumes: true },
      })

      const job = await ctx.db.job.findOne({
        where: { id: args.job },
        include: { location: true, author: true },
      })

      const application = await ctx.db.application.create({
        data: {
          ...args,
          status: 'NEW',
          resume: {
            connect: {
              id: user?.resumes[0].id,
            },
          },
          job: {
            connect: {
              id: args.job,
            },
          },
          //@ts-ignore
          user: { connect: { id: ctx.request.user.id } },
        },
      })

      //update location of user based on location of job
      await ctx.db.user.update({
        where: { id: ctx.request.user.id },
        data: { location: { connect: { id: job?.location.id } } },
      })

      try {
        const mailRes = await transport.sendMail({
          from: process.env.EMAIL_FROM,
          to: user?.email,
          subject: `${appText.emails.applications.onTheWay.subject(
            job?.title,
          )}!`,
          html: makeANiceEmail(
            appText.emails.applications.onTheWay.body(
              user?.name,
              job?.title,
              job?.location.name,
            ),
          ),
        })

        const mailRecruiterRes = await transport.sendMail({
          from: process.env.EMAIL_FROM,
          to: job?.author.email,
          subject: `${appText.emails.applications.hasNewApplication.subject(
            job?.title,
          )}!`,
          html: makeANiceEmail(
            appText.emails.applications.hasNewApplication.body(
              job?.author.name,
              user?.name,
              job?.title,
              job?.location.name,
              application.id,
            ),
          ),
        })
      } catch (ex) {
        console.log(ex)
      }

      return application
    },
  })

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
          include: { user: true },
        })

        const applicant = application.user

        //Auto archive other applications if employee is hired
        if (args.status === 'HIRED') {
          const otherApplications = await ctx.db.application.findMany({
            where: { id: applicant.id },
          })

          await ctx.db.application.updateMany({
            where: {
              AND: [{ userId: applicant.id }, { status: { not: 'HIRED' } }],
            },
            data: { status: 'ARCHIVED' },
          })

          for (let i = 0; i < otherApplications.length; i++) {
            const otherApp = otherApplications[i]

            await ctx.db.applicationNote.create({
              data: {
                content: appText.messages.applicantion.autoArchive,
                //@ts-ignore
                user: { connect: { id: ctx.request.user.id } },
                application: { connect: { id: otherApp.id } },
                type: 'NOTE',
              },
            })
          }
        }

        try {
          const applicationNote = await ctx.db.applicationNote.create({
            data: {
              content: args.status,
              //@ts-ignore
              user: { connect: { id: ctx.request.user.id } },
              application: { connect: { id: args.id } },
              type: 'STATUS',
            },
          })
        } catch (error) {
          console.log('note not added')
        }

        return application
      } catch (err) {
        return null
      }
    },
  })
}
