import { apply, setup } from 'twind'
import * as colors from 'twind/colors'

setup({
  preflight: {
    a: apply('text(blue-500 underline) cursor-pointer')
  },
  theme: {
    colors: {
      gray: colors.coolGray,
      blue: colors.lightBlue,
      red: colors.rose,
      pink: colors.fuchsia,
    },
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  // There is no need to include the variants section Twind supports all variants plus more with no additional configuration required
})
