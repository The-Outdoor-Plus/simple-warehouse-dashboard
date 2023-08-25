// eslint-disable-next-line no-undef
module.exports = {
  client: {
    service: {
      name: 'simple-warehouse-dashboard',
      url: import.meta.env.VITE_MONDAY_API_URL || 'https://api.monday.com/v2',
    },
    includes: [
      'src/**/*.vue',
      'src/**/*.js',
      'src/**/*.ts',
    ],
  },
}