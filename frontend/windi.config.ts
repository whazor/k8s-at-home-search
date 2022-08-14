import { defineConfig } from 'windicss/helpers'
import colors from 'windicss/colors'
// import plugin from 'windicss/plugin'

export default defineConfig({
  /* configurations... */
  darkMode: 'media',
  colors: {
    gray: colors.coolGray,
    blue: colors.lightBlue,
    red: colors.rose,
    pink: colors.fuchsia,
  },
  fontFamily: {
    sans: ['Source Sans Pro', 'sans-serif'],
    serif: ['Roboto slab', 'serif'],
  },
  shortcuts: {
    "link": "blue underline",
    "btn": "cursor-pointer border p-0 px-0.5 mx-1 rounded inline-block bg-gray-100 align-middle",
    "table-outside": "overflow-hidden overflow-x-auto border border-gray-100 rounded",
    "table-inside": "min-w-full text-sm divide-y divide-gray-200",
    "tbody": "divide-y divide-gray-100",
    "tr-head": "bg-gray-50",
    "cell": "px-2 py-1 gray-700 whitespace-nowrap dark:bg-gray-100",
    "th": "px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap",
    "th-sortable": "cursor-pointer"
  }
});
