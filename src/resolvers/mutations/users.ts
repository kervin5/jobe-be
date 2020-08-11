import { compare, genSalt, hash } from 'bcryptjs'
import { core } from 'nexus/components/schema'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import { schema } from 'nexus'
import { transport, makeANiceEmail } from '../../utils/mail'
import appText from '../../../lang/appText'

//TODO: DELETE
import { sign_s3_read } from '../../utils/aws'
import request from '../../utils/request'
import { findKeywords } from '../../utils/functions'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  // t.int('updateLocation', {
  //   resolve: async (parent, args, ctx) => {
  //     const users = (
  //       await ctx.db.user.findMany({
  //         where: { location: null },
  //         select: {
  //           id: true,
  //           applications: { include: { job: { include: { location: true } } } },
  //           favorites: { include: { job: { include: { location: true } } } },
  //         },
  //       })
  //     ).filter((user) => user.applications.length || user.favorites.length)

  //     const updateData = users.map((user) => {
  //       const lastApplication = user.applications.pop()
  //       const lastFavorite = user.favorites.pop()
  //       const userData = {
  //         location: lastApplication
  //           ? lastApplication.job.location.id
  //           : lastFavorite?.job.location.id,
  //         id: user.id,
  //       }
  //       return userData
  //     })

  //     async function* generateSequence(usersToUpdate: any) {
  //       for (let i = 0; i < usersToUpdate.length; i++) {
  //         const userData = usersToUpdate[i]
  //         // yay, can use await!
  //         // await new Promise(resolve => setTimeout(resolve, 1000));
  //         const updateResult = await ctx.db.user.update({
  //           where: { id: userData.id },
  //           data: { location: { connect: { id: userData.location } } },
  //         })
  //         yield { i: `${i} of ${usersToUpdate.length}`, updateResult }
  //       }
  //     }

  //     const generator = generateSequence(updateData)

  //     for await (let result of generator) {
  //       console.log(result)
  //     }
  //     return updateData.length
  //   },
  // })
  t.field('createUser', {
    type: 'User',
    args: {
      name: schema.stringArg({ required: true }),
      email: schema.stringArg({ required: true }),
      role: schema.idArg(),
      branch: schema.idArg(),
      otherBranches: schema.arg({ type: 'BranchChangeInput', list: true }),
    },
    resolve: async (parent, args, ctx) => {
      const salt = await genSalt(10)

      const randomBytesPromisified = promisify(randomBytes)
      const resetToken = (await randomBytesPromisified(20)).toString('hex')
      const resetTokenExpiry = (Date.now() + 3600000) * 24 // 1 hour from now

      const user = await ctx.db.user.create({
        data: {
          ...args,
          email: args.email.trim(),
          branch: {
            //@ts-ignore
            connect: { id: args.branch },
          },

          otherBranches: {
            //@ts-ignore
            connect: args.otherBranches
              ? args.otherBranches.map((br) => ({ id: br.id }))
              : [],
          },
          status: 'ACTIVE', //@ts-ignore
          role: { connect: { id: args.role } },
          password: await hash(resetToken + resetTokenExpiry, salt),
          resetToken,
          resetTokenExpiry,
        },
      })

      const mailRes = await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: appText.emails.users.invite.subject,
        html: makeANiceEmail(
          appText.emails.users.invite.body(resetToken, args.name),
        ),
      })
      return user
    },
  })
  t.field('signup', {
    type: 'User',
    args: {
      name: schema.stringArg({ required: true }),
      password: schema.stringArg({ required: true }),
      email: schema.stringArg({ required: true }),
      phone: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      const salt = await genSalt(10)

      let usersCount = await ctx.db.user.count()

      //A role must exist in the database
      let [defaultRole] = await ctx.db.role.findMany({
        where: { name: 'candidate' },
      })

      if (!defaultRole) {
        defaultRole = await ctx.db.role.create({
          data: {
            name: 'candidate',
            permissions: {
              create: [
                {
                  object: 'JOB',
                  actions: { set: ['READ'] },
                },
                {
                  object: 'APPLICATION',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'FAVORITE',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'RESUME',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
              ],
            },
          },
        })
      }

      if (!usersCount) {
        defaultRole = await ctx.db.role.create({
          data: {
            name: 'administrator',
            permissions: {
              create: [
                {
                  object: 'JOB',
                  actions: {
                    set: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH'],
                  },
                },
                {
                  object: 'APPLICATION',
                  actions: {
                    set: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
                  },
                },
                {
                  object: 'USER',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'ROLE',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'PERMISSION',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'SKILL',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'CATEGORY',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'BRANCH',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'COMPANY',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'RESUME',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
                {
                  object: 'FAVORITE',
                  actions: { set: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
                },
              ],
            },
          },
        })
      }

      try {
        const user = await ctx.db.user.create({
          data: {
            ...args,
            email: args.email.trim(),
            phone: sanitizePhoneNumber(args.phone),
            password: await hash(args.password, salt),
            status: 'ACTIVE',
            role: {
              connect: { id: defaultRole.id },
            },
          },
          include: { role: true },
        })

        const token = jwt.sign(
          { id: user.id },
          process.env.APP_SECRET as string,
        )
        // 4. Set the cookie with the token
        //@ts-ignore
        ctx.response.header('token', token)
        //@ts-ignore
        ctx.response.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        })
        // console.log(user);
        return user
      } catch (error) {
        console.log({ error })
        throw new Error(appText.messages.user.alreadyExists)
      }
    },
  })

  t.field('login', {
    type: 'User',
    args: {
      email: schema.stringArg({ nullable: false }),
      password: schema.stringArg({ nullable: false }),
    },
    resolve: async (_parent, { email, password }, ctx) => {
      const user = await ctx.db.user.findOne({
        where: {
          email,
        },
      })

      if (!user) {
        throw new Error(appText.messages.user.doesnExist(email))
      }

      const userIsActive = await ctx.db.user.count({
        where: {
          email: user.email,
          status: 'ACTIVE',
        },
      })

      if (!userIsActive) {
        throw new Error(appText.messages.user.notActive)
      }

      const passwordValid = await compare(password, user.password)
      if (!passwordValid) {
        throw new Error(appText.messages.user.invalidPassword)
      }
      // 3. generate the JWT Token
      const token = jwt.sign({ id: user.id }, process.env.APP_SECRET as string)
      //@ts-ignore
      ctx.response.header('token', `Bearer ${token}`)
      //@ts-ignore
      ctx.response.cookie('token', `Bearer ${token}`, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
        path: '/',
      })

      return user
    },
  })

  t.string('logout', {
    nullable: true,
    resolve: async (parent, args, ctx) => {
      //@ts-ignore
      ctx.response.clearCookie('token')
      return 'log out'
    },
  })

  t.field('deleteUser', {
    type: 'User',
    nullable: true,
    args: {
      id: schema.idArg(),
    },
    resolve: async (parent, args, ctx) => {
      //get userData
      const user = await ctx.db.user.findOne({
        //@ts-ignore
        where: { id: args.id },
        include: { branch: true },
      })

      const jobs = await ctx.db.job.findMany({
        //@ts-ignore
        where: { status: { not: 'DELETED' }, author: { id: args.id } },
      })

      if (jobs.length) {
        //Find next user from the same branch
        const recruiters = await ctx.db.user.findMany({
          where: {
            //@ts-ignore
            branch: { id: user?.branch?.id },
            id: { not: user?.id },
            role: { name: 'recruiter' },
          },
          take: 1,
        })

        if (recruiters.length) {
          const [coworker] = recruiters
          const result = jobs.map((job) =>
            ctx.db.job.update({
              where: { id: job.id },
              data: { author: { connect: { id: coworker.id } } },
            }),
          )
          await Promise.all(result)
        } else {
          const managers = await ctx.db.user.findMany({
            where: {
              //@ts-ignore
              branch: { id: user?.branch?.id },
              id: { not: user?.id },
              role: { name: 'manager' },
            },
            take: 1,
          })

          if (managers.length) {
            const [coworker] = managers
            const result = jobs.map((job) =>
              ctx.db.job.update({
                where: { id: job.id },
                data: { author: { connect: { id: coworker.id } } },
              }),
            )
            await Promise.all(result)
          } else {
            await ctx.db.job.updateMany({
              where: { author: { id: user?.id } },
              data: {
                status: 'DELETED',
              },
            })

            await ctx.db.application.updateMany({
              where: { job: { author: { id: user?.id } } },
              data: { status: 'ARCHIVED' },
            })
          }
        }
      }

      // console.log(user);
      // console.log(jobs);
      return ctx.db.user.update({
        where: { id: user?.id },
        data: { status: 'DELETED' },
      })
    },
  })

  t.field('activateUser', {
    type: 'User',
    nullable: true,
    args: {
      id: schema.idArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.db.user.update({
        where: { id: args.id },
        data: { status: 'ACTIVE' },
      })
    },
  })

  t.field('updateUser', {
    type: 'User',
    nullable: true,
    args: {
      id: schema.idArg({ required: true }),
      name: schema.stringArg(),
      branch: schema.idArg(),
      otherBranches: schema.arg({ type: 'BranchChangeInput', list: true }),
      role: schema.idArg(),
    },
    resolve: async (parent, args, ctx) => {
      const name = args.name ? { name: args.name } : {}
      const branch = args.branch
        ? {
            branch: { connect: { id: args.branch } },
          }
        : {}
      const role = args.role ? { role: { connect: { id: args.role } } } : {}
      const otherBranchesToDisconnect: any[] = []
      const otherBranchesToConnect: any[] = []

      args.otherBranches?.forEach((otherBranch) => {
        if (otherBranch.active) {
          otherBranchesToConnect.push({ id: otherBranch.id })
        } else {
          otherBranchesToDisconnect.push({ id: otherBranch.id })
        }
      })

      let otherBranches: any = {}

      if (otherBranchesToConnect.length) {
        otherBranches = { otherBranches: { connect: otherBranchesToConnect } }
      }

      if (otherBranchesToDisconnect.length) {
        if (!otherBranchesToConnect.length) {
          otherBranches['otherBranches'] = {}
        }
        otherBranches['otherBranches']['disconnect'] = otherBranchesToDisconnect
      }

      return ctx.db.user.update({
        where: { id: args.id },
        data: {
          ...name,
          ...branch,
          ...role,
          ...otherBranches,
        },
      })
    },
  })

  t.string('requestReset', {
    args: { email: schema.stringArg({ required: true }) },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { email: args.email },
      })

      if (!user) throw new Error('Invalid user')

      const userIsActive = await ctx.db.user.count({
        where: { email: args.email, status: 'ACTIVE' },
      })

      if (!userIsActive) throw new Error(appText.messages.user.notActive)

      const randomBytesPromisified = promisify(randomBytes)
      const resetToken = (await randomBytesPromisified(20)).toString('hex')
      const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now

      const res = await ctx.db.user.update({
        where: { email: args.email },
        data: { resetToken, resetTokenExpiry },
      })

      const mailRes = await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: appText.emails.users.reset.subject,
        html: makeANiceEmail(appText.emails.users.reset.body(resetToken)),
      })

      return args.email
    },
  })

  t.field('resetPassword', {
    type: 'User',
    args: {
      token: schema.stringArg({ required: true }),
      password: schema.stringArg({ required: true }),
      confirmPassword: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      // 1. Check if the passwords match
      if (args.password !== args.confirmPassword) {
        throw new Error(`${appText.messages.user.passwordsDontMatch}!`)
      }
      // 2. Check if its a legit reset token
      // 3. Check if its expired
      const [user] = await ctx.db.user.findMany({
        where: {
          resetToken: args.token,
          resetTokenExpiry: { gte: Date.now() - 3600000 },
        },
      })

      if (!user) throw new Error(`${appText.messages.user.invalidToken}!`)
      // 4. Hash their new password
      const password = await hash(args.password, 10)
      // 5. Save the new password to the user and remove old reset token fields
      const updatedUser = await ctx.db.user.update({
        where: { email: user.email },
        data: {
          password,
          resetToken: null,
          resetTokenExpiry: null,
        },
      })
      // 6. Generate JWT
      const token = jwt.sign(
        { id: updatedUser.id },
        process.env.APP_SECRET as string,
      )
      // 7. Set the JWT cookie
      //@ts-ignore
      ctx.response.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      })
      // 8. Return the new user
      return updatedUser
      // 9. Amazing
    },
  })
}

function titleCase(str: string = '') {
  let string = str.toLowerCase().split(' ')
  for (var i = 0; i < string.length; i++) {
    string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1)
  }
  return string.join(' ')
}

export function sanitizePhoneNumber(phone: string) {
  const result = phone
    ? (phone.includes('\n') ? phone.split('\n')[1] : phone).replace(/\D/g, '')
    : undefined

  return result
    ? result.length > 10
      ? result.substring(result.length - 10, result.length)
      : result.length === 7 || result.length > 9
      ? result
      : undefined
    : undefined
}
