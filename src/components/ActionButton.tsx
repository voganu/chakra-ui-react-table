import * as React from 'react';
import { IconButton, IconButtonProps } from '@chakra-ui/core';

interface ActionButtonProps extends IconButtonProps {
  onClick?: ((event: React.MouseEvent<any, MouseEvent>) => void) | undefined;
  'aria-label': string;
}

function ActionButton({ icon, onClick, ...props }: ActionButtonProps) {
  return (
    <IconButton
      color="gray.700"
      bg="gray.50"
      icon={icon}
      size="md"
      _hover={{ bg: 'gray.100' }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      {...props}
    />
  );
}
export default ActionButton;
