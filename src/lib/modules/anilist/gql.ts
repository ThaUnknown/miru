import { initGraphQLTada } from 'gql.tada'

import type { introspection } from './graphql-env'

export default initGraphQLTada<{ introspection: introspection }>()
