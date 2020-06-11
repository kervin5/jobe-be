import { core } from 'nexus/components/schema'
export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.crud.skills({ filtering: true, ordering: true })
}
