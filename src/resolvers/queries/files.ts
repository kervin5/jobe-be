import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg } from '@nexus/schema'
import { sign_s3_read } from '../../utils/aws'

export default (t: ObjectDefinitionBlock<'Query'>) => {
  t.string('getSignedFileUrl', {
    nullable: true,
    args: {
      AWSUrl: stringArg({ required: true }),
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
