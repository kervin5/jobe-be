import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'

export default (t: ObjectDefinitionBlock<'Query'>) => {
  t.crud.category()
  t.crud.categories()
}
