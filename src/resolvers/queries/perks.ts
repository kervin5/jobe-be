import { core } from 'nexus/components/schema'
export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.crud.perks({ filtering: true, ordering: true, pagination: true })
}
