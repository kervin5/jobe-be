import { schema } from 'nexus'
import { core } from 'nexus/components/schema'
import { sign_s3_read } from '../../utils/aws'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
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
      // console.log({ result, file })
      return result
    },
  })
}
