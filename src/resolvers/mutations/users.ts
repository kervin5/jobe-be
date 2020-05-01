import { compare, genSalt, hash } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
//const { forwardTo } = require("prisma-binding");
import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg, arg, idArg } from '@nexus/schema'
import { can } from '../../permissions/auth'
import { transport, makeANiceEmail } from '../../utils/mail'

interface JobFilter {
  branch?: object
  company?: object
  author?: object
}

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createUser', {
    type: 'User',
    args: {
      name: stringArg(),
      email: stringArg(),
      role: idArg(),
      branch: idArg(),
    },
    resolve: async (parent, args, ctx) => {
      const salt = await genSalt(10)

      const randomBytesPromisified = promisify(randomBytes)
      const resetToken = (await randomBytesPromisified(20)).toString('hex')
      const resetTokenExpiry = (Date.now() + 3600000) * 24 // 1 hour from now

      const user = await ctx.prisma.user.create({
        data: {
          ...args,
          branch: {
            connect: { id: args.branch },
          },
          status: 'ACTIVE',
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
  }),
    t.field('login', {
      type: 'User',
      args: {
        email: stringArg({ nullable: false }),
        password: stringArg({ nullable: false }),
      },
      resolve: async (_parent, { email, password }, ctx) => {
        const user = await ctx.prisma.user.findOne({
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
        const token = jwt.sign({ id: user.id }, process.env.APP_SECRET)

        ctx.response.header('token', `Bearer ${token}`)

        ctx.response.cookie('token', `Bearer ${token}`, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365,
          path: '/',
        })

        return user
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
