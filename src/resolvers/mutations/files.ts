import { schema } from 'nexus'
import { core } from 'nexus/components/schema'
import { sign_s3_upload } from '../../utils/aws'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('signFileUpload', {
    type: 'SignedFileUploadRequest',
    nullable: true,
    args: {
      fileName: schema.stringArg({ required: true }),
      fileType: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      const result = await sign_s3_upload({
        fileName: args.fileName,
        fileType: args.fileType,
      })

      return result.success ? result.data : null
    },
  })
}
