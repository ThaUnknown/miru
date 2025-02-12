// @ts-expect-error no types for this, that's fine
import { writeFileSync } from 'node:fs'

import { getIntrospectionQuery, type IntrospectionQuery } from 'graphql'
import { getIntrospectedSchema, minifyIntrospectionQuery } from '@urql/introspection'

const res = await fetch('https://graphql.anilist.co', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query: getIntrospectionQuery({ descriptions: false })
  })
})
const { data } = (await res.json()) as { data: IntrospectionQuery }
const minified = minifyIntrospectionQuery(getIntrospectedSchema(data), { includeScalars: false, includeEnums: true, includeInputs: true, includeDirectives: true })
writeFileSync('./src/lib/modules/anilist/schema.json', JSON.stringify(minified))
