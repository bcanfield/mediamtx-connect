import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  react: true,
  ignores: ['**/dist', 'apps/api/public'],
})
