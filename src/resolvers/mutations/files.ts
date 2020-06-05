import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg } from '@nexus/schema'
import { sign_s3_upload } from '../../utils/aws'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('signFileUpload', {
    type: 'SignedFileUploadRequest',
    nullable: true,
    args: {
      fileName: stringArg({ required: true }),
      fileType: stringArg({ required: true }),
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
