import * as React from 'react';
import { PseudoBox, PseudoBoxProps } from '@chakra-ui/core';

const defaultRowComponent = 'tr';

interface TableRowProps extends PseudoBoxProps {
  as?: React.ElementType;
  isSelected?: boolean;
}

export const TableRow = React.forwardRef<typeof PseudoBox, TableRowProps>(
  function TableHead(props, ref) {
    const { as: As = defaultRowComponent, isSelected, ...other } = props;

    return (
      <PseudoBox
        role="group"
        ref={ref}
        as={As}
        _hover={{
          cursor: 'pointer',
          backgroundColor: isSelected ? 'pink.50' : 'gray.50',
        }}
        bg={isSelected ? 'pink.100' : undefined}
        {...other}
      />
    );
  },
);
