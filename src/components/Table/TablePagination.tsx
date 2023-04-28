import * as React from 'react';
import { Flex } from '@chakra-ui/core';
import { FlexProps } from '@chakra-ui/core/dist/Flex';

type TablePaginationProps = FlexProps;

export const TablePagination: React.FC<TablePaginationProps> = ({
  children,
  ...rest
}) => {
  return (
    <Flex borderTopWidth="1px" overflowX="hidden" overflowY="hidden" {...rest}>
      {children}
    </Flex>
  );
};

TablePagination.defaultProps = {
  px: 4,
  py: 2,
  // bg: "white",
  roundedBottomLeft: 4,
  roundedBottomRight: 4,
  flexDirection: 'column',
};
