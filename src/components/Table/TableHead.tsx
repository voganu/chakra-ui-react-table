import * as React from 'react';
import { PseudoBox, PseudoBoxProps } from '@chakra-ui/core';

import TableContext from './TableContext';

const defaultHeadComponent = 'thead';

interface TableHeadProps extends PseudoBoxProps {
  as?: React.ElementType;
}

export const TableHead = React.forwardRef<
  any,
  React.PropsWithChildren<TableHeadProps>
>(function TableHead(props, ref) {
  const { as: As = defaultHeadComponent, ...other } = props;

  return (
    <TableContext.Provider
      value={{
        variant: 'head',
      }}
    >
      <PseudoBox display="table-header-group" ref={ref} as={As} {...other} />
    </TableContext.Provider>
  );
});
