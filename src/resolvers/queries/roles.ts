import { core } from 'nexus/components/schema'
export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.crud.roles({ filtering: true })
}
