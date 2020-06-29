import { schema } from 'nexus'
import { core } from 'nexus/components/schema'
import { fetchLocation } from '../../utils/location'
import { can } from '../../permissions/auth'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('incrementJobViewCount', {
    type: 'Job',
    args: { id: schema.stringArg({ required: true }) },
    resolve: async (parent, args, ctx) => {
      const job = await ctx.db.job.findOne({ where: { id: args.id } })
      return ctx.db.job.update({
        where: { id: args.id },
        data: { views: job?.views ? job.views + 1 : 1 },
      })
    },
  })
  t.field('createJob', {
    type: 'Job',
    nullable: true,
    args: {
      title: schema.stringArg({ required: true }),
      description: schema.stringArg({ required: true }),
      compensationType: schema.stringArg({ required: true }),
      disclaimer: schema.stringArg(),
      type: schema.stringArg({ required: true }),
      minCompensation: schema.floatArg({ required: true }),
      maxCompensation: schema.floatArg(),
      location: schema.stringArg({ required: true }),
      categories: schema.stringArg({ list: true, required: true }),
      skills: schema.stringArg({ list: true, required: true }),
      perks: schema.stringArg({ list: true }),
      author: schema.stringArg(),
      isRecurring: schema.booleanArg(),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      const jobLocation = {
        name: args.location,
      }

      const jobIsRecurring = !!args.isRecurring
      delete args.isRecurring

      // Checks if location exists in DB
      const locationExists =
        (await ctx.db.location.findMany({ where: jobLocation })).length > 0

      let location = {}

      if (locationExists) {
        const existingLocations = await ctx.db.location.findMany({
          where: jobLocation,
        })

        location = { connect: { id: existingLocations[0].id } }
      } else {
        const fetchedLocation = await fetchLocation(args.location || '')
        location = {
          create: {
            name: args.location,
            longitude: fetchedLocation.center[1],
            latitude: fetchedLocation.center[0],
            boundary: { set: fetchedLocation.bbox },
          },
        }
      }

      let authorId = ctx.request.user.id

      if (
        args.author &&
        args.author !== '' &&
        ((await can('READ', 'BRANCH', ctx)) ||
          (await can('READ', 'COMPANY', ctx)) ||
          (await can('READ', 'USER', ctx)))
      ) {
        authorId = args.author
      } else {
        // console.log(args);
      }

      //Verify if perks exist
      const allPerks = (await ctx.db.perk.findMany()).map((perk) => perk.id)
      const incomingPerks = args.perks ?? []
      let perksToCreate: any = []
      let perksToConnect = []

      if (!!incomingPerks.length) {
        perksToCreate = incomingPerks.filter(
          (incomingPerk) => !allPerks.includes(incomingPerk),
        )
      }

      perksToConnect = incomingPerks.filter((incomingPerk) =>
        allPerks.includes(incomingPerk),
      )

      const job = await ctx.db.job.create({
        data: {
          ...args,
          categories: {
            connect: args.categories.map((category: string) => ({
              id: category,
            })),
          },
          skills: {
            connect: args.skills.map((skill: string) => ({ id: skill })),
          },
          perks: {
            create: perksToCreate.map((perk: any) => ({
              name: perk,
              author: { connect: { id: ctx.request.user.id } },
            })),
            connect: perksToConnect.map((perk) => ({ id: perk })),
          },
          status: 'DRAFT',
          author: { connect: { id: authorId } },
          location,
          branch: { connect: { id: user?.branch?.id } },
          maxCompensation: args.maxCompensation || 0,
        },
      })

      if (jobIsRecurring) {
        //await scheduleJobAutoUpdate(ctx, job.id)TODO: Implement recurring jobs
      } else {
        //console.log(args) TODO: Handle jobs that are not recurring
      }

      return job
    },
  })
  t.field('deleteJob', {
    type: 'Job',
    nullable: true,
    args: {
      id: schema.idArg({ required: true }),
    },
    resolve: async (parent, args, ctx, info) => {
      const jobs = await ctx.db.job.findMany({
        where: {
          id: args.id,
          author: { id: ctx.request.user.id },
        },
      })

      if (
        jobs.length > 0 ||
        (await can('UPDATE', 'BRANCH', ctx)) ||
        (await can('UPDATE', 'COMPANY', ctx))
      ) {
        await ctx.db.application.updateMany({
          where: {
            job: { id: args.id },
            status: { notIn: ['ARCHIVED', 'HIRED'] },
          },
          data: { status: 'ARCHIVED' },
        })

        return ctx.db.job.update({
          where: { id: args.id },
          data: { status: 'DELETED' },
        })
      }
      return null
    },
  })

  t.field('updateJob', {
    type: 'Job',
    nullable: true,
    args: {
      where: schema.arg({ type: 'JobWhereUniqueInput', required: true }),
      data: schema.arg({ type: 'UpdateJobCustomInput', required: true }),
    },
    resolve: async (parent, args, ctx, info) => {
      let authorId = ctx.request.user.id
      let JobDataToUpdate: any = { ...args.data } //TODO: Implement interface to define payload of object

      if (
        JobDataToUpdate.author &&
        JobDataToUpdate.author !== '' &&
        ((await can('READ', 'BRANCH', ctx)) ||
          (await can('READ', 'COMPANY', ctx)) ||
          (await can('READ', 'USER', ctx)))
      ) {
        authorId = JobDataToUpdate.author
      } else {
        const job = await ctx.db.job.findOne({
          //@ts-ignore
          where: { id: args.where.id },
          include: { location: true, author: true },
        })
        //@ts-ignore
        authorId = job?.author.id
      }

      const jobs = await ctx.db.job.findMany({
        where: {
          //@ts-ignore
          id: args.where.id,
          author: { id: authorId },
        },
      })

      if (
        jobs.length > 0 ||
        (await can('UPDATE', 'BRANCH', ctx)) ||
        (await can('UPDATE', 'COMPANY', ctx))
      ) {
        if (JobDataToUpdate.location) {
          const locationExists =
            (
              await ctx.db.location.findMany({
                where: { name: JobDataToUpdate.location },
              })
            ).length > 0

          if (locationExists) {
            const existingLocations = await ctx.db.location.findMany({
              where: {
                name: JobDataToUpdate.location,
              },
            })
            //Deletes the create mutation and forces connection to existing location if the location already exists
            JobDataToUpdate.location = {
              connect: {
                id: existingLocations[0].id,
              },
            }
          } else {
            const fetchedLocation = await fetchLocation(
              JobDataToUpdate.location,
            )
            JobDataToUpdate.location = {
              create: {
                name: JobDataToUpdate.location,
                longitude: fetchedLocation.center[1],
                latitude: fetchedLocation.center[0],
                boundary: { set: fetchedLocation.bbox },
              },
            }
          }
        }
        // console.log(args);
        //Connect User to job
        if (JobDataToUpdate.categories) {
          JobDataToUpdate.categories = {
            set: JobDataToUpdate.categories.map((category: string) => ({
              id: category,
            })),
          }
        }

        if (JobDataToUpdate.skills) {
          JobDataToUpdate.skills = {
            set: JobDataToUpdate.skills.map((skill: string) => ({ id: skill })),
          }
        }

        const allPerks = (await ctx.db.perk.findMany()).map((perk) => perk.id)
        const incomingPerks = JobDataToUpdate.perks ?? []

        let perksToCreate: any = []
        let perksToConnect = []

        if (JobDataToUpdate.perks) {
          if (!!incomingPerks.length) {
            perksToCreate = incomingPerks.filter(
              (incomingPerk: any) => !allPerks.includes(incomingPerk),
            )
          }

          perksToConnect = incomingPerks.filter((incomingPerk: any) =>
            allPerks.includes(incomingPerk),
          )

          JobDataToUpdate.perks = {
            create: perksToCreate.map((perk: any) => ({
              name: perk,
              author: { connect: { id: ctx.request.user.id } },
            })),
            set: perksToConnect.map((perk: any) => ({ id: perk })),
          }
        }

        if (!JobDataToUpdate.status) {
          JobDataToUpdate.status = 'DRAFT'
        }

        const user = await ctx.db.user.findOne({
          where: { id: authorId },
          include: { branch: { include: { company: true } } },
        })

        JobDataToUpdate.author = { connect: { id: authorId } }
        JobDataToUpdate['branch'] = { connect: { id: user?.branch?.id } }
        const job = await ctx.db.job.update({
          //@ts-ignore
          where: args.where,
          data: JobDataToUpdate,
        })

        return job
      } else {
        return null
      }
    },
  })
}

interface IJobUpdateData {}
