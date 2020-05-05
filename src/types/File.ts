import { objectType } from '@nexus/schema'

export const File = objectType({
  name: 'File',
  definition(t) {
    t.model.id()
  },
})

export const SignedFileUploadRequest = objectType({
  name: 'SignedFileUploadRequest',
  definition(t) {
    t.string('signedRequest')
    t.string('url')
    t.string('acl')
  },
})
