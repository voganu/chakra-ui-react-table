import * as React from 'react';
import { PseudoBox, PseudoBoxProps } from '@chakra-ui/core';
import TableContext from './TableContext';

export type TableCellBaseProps = React.ThHTMLAttributes<
  HTMLTableHeaderCellElement
> &
  React.TdHTMLAttributes<HTMLTableDataCellElement>;

export const TableCell = ({
  children,
  as: As,
  ...props
}: React.PropsWithChildren<PseudoBoxProps & TableCellBaseProps>) => {
  const table = React.useContext(TableContext);
  const isHeadCell = table?.variant === 'head';
  return (
    <PseudoBox
      as={As ? As : isHeadCell ? 'th' : 'td'}
      borderBottom={isHeadCell ? '1px solid' : undefined}
      borderBottomColor="gray.300"
      fontSize="xs"
      textAlign="left"
      px={4}
      py={2}
      whiteSpace="nowrap"
      /* The secret sauce */
      /* Each cell should grow equally */
      w="1%"
      /* But "collapsed" cells should be as small as possible */
      // _last={{ w: '0.0000000001%' }}
      _last={{ w: '0.1%' }}
      {...props}
    >
      {children}
    </PseudoBox>
  );
};
