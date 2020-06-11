import { schema } from 'nexus'
import { sign_s3_read } from '../../utils/aws'

export default (t) => {
  t.string('getSignedFileUrl', {
    nullable: true,
    args: {
      AWSUrl: schema.stringArg({ required: true }),
    },

    resolve: async (parent, args, ctx) => {
      const [file] = await ctx.db.file.findMany({
        where: { path: { endsWith: args.AWSUrl } },
      })
      let result = null

      if (file) {
        result = await sign_s3_read(file.path)
      }
      console.log({ result, file })
      return result
    },
  })
}
