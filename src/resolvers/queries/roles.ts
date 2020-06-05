import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'

export default (t: ObjectDefinitionBlock<'Query'>) => {
  t.crud.roles({filtering: true})
}
