import { PseudoBox, PseudoBoxProps } from '@chakra-ui/core';
import * as React from 'react';

import TableContext from './TableContext';

const defaultBodyComponent = 'tbody';

interface TableBodyProps extends PseudoBoxProps {
  as?: React.ElementType;
}

export const TableBody = React.forwardRef<
  any,
  React.PropsWithChildren<TableBodyProps>
>(function TableHead(props, ref) {
  const { as: As = defaultBodyComponent, ...other } = props;

  return (
    <TableContext.Provider
      value={{
        variant: 'body',
      }}
    >
      <PseudoBox display="table-row-group" ref={ref} as={As} {...other} />
    </TableContext.Provider>
  );
});
