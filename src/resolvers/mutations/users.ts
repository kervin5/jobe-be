import { compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
//const { forwardTo } = require("prisma-binding");
import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg, arg, intArg } from '@nexus/schema'
import { can } from '../../permissions/auth'

interface JobFilter {
  branch?: object
  company?: object
  author?: object
}

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
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
