import { objectType } from '@nexus/schema'

export const File = objectType({
  name: 'File',
  definition(t) {
    t.model.id()
    t.model.createdAt()
    t.model.mimetype()
    t.model.path()
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
