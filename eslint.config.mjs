import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      '.next/',
      'node_modules/',
      'src/app/(payload)/admin/importMap.js',
      'src/migrations/',
      'src/payload/payload-types.ts',
    ],
  },
]

export default config
