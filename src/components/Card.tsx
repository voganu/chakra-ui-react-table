import React from 'react';
import { BoxProps, PseudoBox } from '@chakra-ui/core';

export type CardProps = BoxProps & {
  onClick?: () => void;
  title?: string;
  text?: string;
  useDefaultText?: boolean;
};

const Card: React.FC<CardProps> = ({
  children,
  title,
  text,
  useDefaultText,
  ...rest
}) => {
  return (
    <PseudoBox
      d="flex"
      flexDirection="column"
      w="auto"
      roundedTop="lg"
      bg="white"
      // overflow="hidden"
      boxShadow="0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)"
      pos="relative"
      roundedBottom="lg"
      {...rest}
    >
      {children}
    </PseudoBox>
  );
};

export default Card;
