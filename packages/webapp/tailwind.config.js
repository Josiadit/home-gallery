const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.white,
        light: {
          '50': '#f5f0e8',
          '100': '#f3ede3',
          '200': '#cdc1b6',
          '300': '#80664e',
          '400': '#c1d1c6',
          '500': '#A7BEAE',
          '600': '#748579',
          '700': '#5a6e5d',
          '800': '#6c727f',
          '900': '#B85042',
          '1000': '#934034'
        },
        info: colors.red,
        danger: colors.red
      },
    },
  },
  plugins: [],
}

