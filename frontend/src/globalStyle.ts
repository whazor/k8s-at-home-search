import { tw } from 'twind'
import { css, theme, apply } from 'twind/css'

// text-blue-500 cursor-pointer text-underline
export const globalStyles = css({
  ':global': {
    a: {
      color: theme('colors.blue.500'),
      text: 'underline',
      cursor: 'pointer',

      '&:hover': apply`text-blue-700`,
    },
  },
})