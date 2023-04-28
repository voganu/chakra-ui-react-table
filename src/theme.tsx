import { theme as chakraTheme } from '@chakra-ui/core';

const theme = {
  ...chakraTheme,
  colors: {
    ...chakraTheme.colors,
    'dark-blue': '#09121a',
    'bright-blue': '#3182ce',
  },
  sizes: {
    ...chakraTheme.sizes,
    '1/2': '50%',
  },
};

export default theme;
