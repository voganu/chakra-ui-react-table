import * as React from 'react';
import { IconButton } from '@chakra-ui/core';
import { SpaceProps } from 'styled-system';

type TableIconButtonProps = SpaceProps & {
  icon: any;
  onClick:
    | ((event: React.MouseEvent<HTMLElement, MouseEvent>) => void)
    | undefined;
  isDisabled: boolean;
  variantColor?: string;
};

export const TableIconButton: React.FC<TableIconButtonProps> = ({
  icon,
  onClick,
  isDisabled,
  children,
  variantColor,
  ...rest
}) => {
  return (
    <IconButton
      size="sm"
      {...rest}
      icon={icon}
      borderWidth={1}
      onClick={onClick}
      variantColor={variantColor}
      isDisabled={isDisabled}
      aria-label="Table Icon button"
    >
      {children}
    </IconButton>
  );
};

TableIconButton.defaultProps = {
  variantColor: 'gray',
};
