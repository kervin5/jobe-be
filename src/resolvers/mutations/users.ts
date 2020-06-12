import { compare, genSalt, hash } from 'bcryptjs'
import { core } from 'nexus/components/schema'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import { schema } from 'nexus'
import { can } from '../../permissions/auth'
import { transport, makeANiceEmail } from '../../utils/mail'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createUser', {
    type: 'User',
    args: {
      name: schema.stringArg({ required: true }),
      email: schema.stringArg({ required: true }),
      role: schema.idArg(),
      branch: schema.idArg(),
    },
    resolve: async (parent, args, ctx) => {
      const salt = await genSalt(10)

      const randomBytesPromisified = promisify(randomBytes)
      const resetToken = (await randomBytesPromisified(20)).toString('hex')
      const resetTokenExpiry = (Date.now() + 3600000) * 24 // 1 hour from now

      const user = await ctx.db.user.create({
        data: {
          ...args,
          branch: {
            //@ts-ignore
            connect: { id: args.branch },
          },
          status: 'ACTIVE', //@ts-ignore
          role: { connect: { id: args.role } },
          password: await hash(resetToken + resetTokenExpiry, salt),
          resetToken,
          resetTokenExpiry,
        },
      })

      const mailRes = await transport.sendMail({
        from: 'noreply@myexactjobs.com',
        to: user.email,
        subject: 'My Exact Jobs Invite',
        html: makeANiceEmail(
          `${args.name}, an account at MyExactJobs has been created for you, please click on the following link to setup your password! \n\n <a href="${process.env.FRONTEND_URL}/user/password/reset?resetToken=${resetToken}">Click Here to Create Password</a>`,
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

        ctx.response.header('token', token)
        ctx.response.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        })
        // console.log(user);
        return user
      } catch (error) {
        console.log({ error })
        throw new Error(`An user with this email already exists`)
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
        throw new Error(`No user found for email: ${email}`)
      }
      const passwordValid = await compare(password, user.password)
      if (!passwordValid) {
        throw new Error('Invalid password')
      }
      // 3. generate the JWT Token
      const token = jwt.sign({ id: user.id }, process.env.APP_SECRET as string)

      ctx.response.header('token', `Bearer ${token}`)

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
      await can('READ', 'BRANCH', ctx)

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

  t.field('updateUser', {
    type: 'User',
    nullable: true,
    args: {
      id: schema.idArg({ required: true }),
      name: schema.stringArg(),
      branch: schema.idArg(),
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
      return ctx.db.user.update({
        where: { id: args.id },
        data: {
          ...name,
          ...branch,
          ...role,
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

      const randomBytesPromisified = promisify(randomBytes)
      const resetToken = (await randomBytesPromisified(20)).toString('hex')
      const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now

      const res = await ctx.db.user.update({
        where: { email: args.email },
        data: { resetToken, resetTokenExpiry },
      })

      const mailRes = await transport.sendMail({
        from: 'noreply@myexactjobs.com',
        to: user.email,
        subject: 'Your Password Reset Token',
        html: makeANiceEmail(
          `Your password Reset Token is here! \n\n <a href="${process.env.FRONTEND_URL}/user/password/reset?resetToken=${resetToken}">Click Here to Reset</a>`,
        ),
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
        throw new Error("Passwords don't match!")
      }
      // 2. Check if its a legit reset token
      // 3. Check if its expired
      const [user] = await ctx.db.user.findMany({
        where: {
          resetToken: args.token,
          resetTokenExpiry: { gte: Date.now() - 3600000 },
        },
      })

      if (!user) throw new Error('This token is either invalid or expired!')
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
