import React, {
  useState,
  ReactElement,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import {
  Text,
  Select,
  Stack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  Input,
  Button,
  IconButton,
  PseudoBox,
  Box,
  Checkbox,
  usePrevious,
  useDisclosure,
  Skeleton,
} from '@chakra-ui/core';
import {
  usePagination,
  useSortBy,
  useTable,
  useRowSelect,
  Row,
  Column,
  useMountedLayoutEffect,
  useExpanded,
  useGroupBy,
} from 'react-table';
import { TableCell } from './TableCell';
import { TableRow } from './TableRow';
import { TableHead } from './TableHead';
import { TableBody } from './TableBody';
import { TableIconButton } from './TableIconButton';
import { TablePagination } from './TablePagination';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronUp,
  FiTrash2,
  FiEdit2,
  FiCopy,
} from 'react-icons/fi';
//   import { useDebounce } from 'react-use';
import { AnimatePresence } from 'framer-motion';
import { Icons } from '@chakra-ui/core/dist/theme/icons';

import { useDebounce } from '../../hooks/use-debounce';
import Card from '../Card';
import PromptDialog from '../PromptDialog';
import ActionButton from '../ActionButton';
import LinearProgressBar from '../LinearProgressBar';

// TODO: Improve Table definitions using
// https://github.com/ggascoigne/react-table-example
// https://github.com/tannerlinsley/react-table/issues/1640

type UpdateDataFn = (id: string, field: string, value: any) => void;

type Actions = {
  label: string;
  icon: Icons | React.ComponentType;
  action: (rowId: string) => void;
};

type TableProps<T extends object = {}> = {
  data: any;
  initialPageSize?: number;
  initialPageIndex?: number;
  initialSearch?: string;
  totalCount?: number;
  loading?: boolean;
  columns: Column<T>[];
  renderRowSubComponent?: ({ row }: { row: any }) => ReactNode;
  onPaginate?: ({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  onSearch?: (search: string) => void;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  onClone?: (id: string) => void;
  onUpdateData?: UpdateDataFn;
  searchPlaceholder?: string;
  addButtonText?: string;
  isSelectable?: boolean;
  getRowId?: (row: any, relativeIndex: number, parent: any) => string;
  isRemoveAllowed?: (row: any) => boolean;
  customActions?: Actions[];
  filters?: ReactElement;
  form?: ReactElement;
  isFormOpen?: boolean;
  removeTitle?: string;
  removeMessage?: string;
  showExpander?: boolean;
  defaultGroupByColumnIds?: string[];
  defaultRowsExpanded?: boolean;
  getRowProps?: (row: any) => void;
  noDataMessage?: string;
};

type EditableCellProps = {
  value?: any;
  row: Row;
  column: Column;
  onUpdateData?: UpdateDataFn;
  editable: boolean;
  type?: string;
};
// Create an editable cell renderer
const EditableCell = ({
  value: initialValue = '',
  row: { id },
  column: { id: columnId, Header },
  onUpdateData,
  editable,
  type,
}: EditableCellProps) => {
  const initialState = initialValue || '';
  const [value, setValue] = React.useState(initialState);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const valueRef = React.useRef<HTMLInputElement>(value);

  const isBoolean = type === 'boolean';
  const isDate = type === 'date';

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(isBoolean ? event.target.checked : event.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    //prevents calling the update data if the onblur is called twice when you click outside the window
    if (value !== valueRef.current) {
      valueRef.current = value;
      onUpdateData?.(id, columnId!, value);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      inputRef.current?.blur();
    }
  };

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialState);
  }, [initialState]);

  if (!editable) {
    return (
      <Text
        fontSize="sm"
        h={8}
        as="span"
        display="inline-flex"
        alignItems="center"
      >
        {initialState}
      </Text>
    );
  }

  if (isBoolean) {
    const label = typeof Header === 'string' ? (Header as string) : '';
    return (
      <Checkbox
        isFullWidth
        isChecked={value}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-label={label}
        justifyContent="center"
      />
    );
  }

  return (
    <Input
      type={isDate ? 'date' : 'text'}
      ref={inputRef}
      onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) =>
        e.stopPropagation()
      }
      onKeyDown={onKeyDown}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      border={0}
      size="sm"
      fontSize="sm"
    />
  );
};

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
  Cell: EditableCell,
};

// Create a default prop getter
const defaultPropGetter = () => ({});

const Table = ({
  columns,
  data,
  initialPageIndex = 0,
  initialPageSize = 10,
  initialSearch,
  totalCount,
  loading,
  onPaginate,
  onSearch,
  onAdd,
  onRemove,
  onEdit,
  onClone,
  onUpdateData,
  searchPlaceholder,
  addButtonText,
  isSelectable = true,
  getRowId,
  customActions,
  filters,
  form,
  isFormOpen,
  renderRowSubComponent,
  isRemoveAllowed,
  showExpander = true,
  defaultGroupByColumnIds,
  defaultRowsExpanded,
  getRowProps = defaultPropGetter,
  noDataMessage,
  ...props
}: TableProps) => {
  const { removeTitle = 'Delete?', removeMessage } = props;
  const controlledPageCount = totalCount
    ? Math.ceil(totalCount / initialPageSize)
    : 1;

  const hasActions = !!(onEdit || onClone || onRemove || customActions);

  const _getRowId = () => {
    if (getRowId) {
      return getRowId;
    }
    return (row: any) => {
      return row.id;
    };
  };

  const {
    isOpen: isRemoveAlertOpen,
    onOpen: onOpenRemoveAlert,
    onClose: onCancelRemove,
  } = useDisclosure();
  const idRef = React.useRef<string>();

  const {
    getTableProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    visibleColumns,
    toggleAllRowsExpanded,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      defaultColumn,
      data,
      initialState: {
        pageIndex: initialPageIndex,
        pageSize: initialPageSize,
        ...(defaultGroupByColumnIds && { groupBy: defaultGroupByColumnIds }),
      },
      manualSortBy: true,
      manualPagination: true,
      pageCount: controlledPageCount,
      autoResetSelectedRows: false,
      autoResetExpanded: false,
      getRowId: _getRowId(),
      onUpdateData,
    },
    useGroupBy,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,
    // Here we will use a plugin to add our selection column
    (hooks) => {
      hooks.visibleColumns.push((columns) => {
        if (!hasActions && !renderRowSubComponent) {
          return columns;
        }

        return [
          ...(renderRowSubComponent && showExpander
            ? [
                {
                  // Make an expander cell
                  Header: () => null, // No header
                  id: 'expander', // It needs an ID
                  Cell: ({ row }: any) => (
                    // Use Cell to render an expander for each row.
                    // We can use the getToggleRowExpandedProps prop-getter
                    // to build the expander.
                    <Box {...row.getToggleRowExpandedProps()}>
                      <Icon
                        name={`${
                          row.isExpanded ? 'chevron-down' : 'chevron-right'
                        }`}
                        size="24px"
                      />
                    </Box>
                  ),
                },
              ]
            : []),
          ...columns,
          ...(hasActions
            ? [
                {
                  id: 'actions',
                  // Don't show any header
                  Header: () => null,
                  // Render action icons in every cell in the last column
                  Cell: ({ row }: any) => (
                    <PseudoBox
                      display="flex"
                      justifyContent="center"
                      mx={1}
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                    >
                      {customActions?.map((action, i) => {
                        return (
                          <ActionButton
                            key={`${action.label}_${i}`}
                            aria-label={action.label}
                            icon={action.icon}
                            onClick={() => {
                              action.action(row.id);
                            }}
                          />
                        );
                      })}
                      {onEdit && (
                        <ActionButton
                          aria-label="Edit"
                          icon={FiEdit2}
                          ml={1}
                          onClick={() => {
                            onEdit(row.id);
                          }}
                        />
                      )}
                      {onRemove && (
                        <ActionButton
                          aria-label="Delete"
                          icon={FiTrash2}
                          ml={1}
                          onClick={() => {
                            idRef.current = row.id;
                            onOpenRemoveAlert();
                          }}
                          isDisabled={isRemoveAllowed && !isRemoveAllowed(row)}
                        />
                      )}
                      {onClone && (
                        <ActionButton
                          aria-label="Clone row"
                          icon={FiCopy}
                          ml={1}
                          onClick={() => {
                            onClone(row.id);
                          }}
                        />
                      )}
                    </PseudoBox>
                  ),
                },
              ]
            : []),
        ];
      });
    },
  );

  const [search, setSearch] = useState<string | undefined>(initialSearch);
  const [isSearchActive, setSearchActive] = useState<boolean>(false);

  // this prevents calling paginate on first mount
  useMountedLayoutEffect(() => {
    if (onPaginate) {
      onPaginate({ pageIndex, pageSize });
    }
  }, [onPaginate, pageIndex, pageSize]);

  React.useEffect(() => {
    if (defaultRowsExpanded) {
      toggleAllRowsExpanded(defaultRowsExpanded);
    }
  }, [defaultRowsExpanded, toggleAllRowsExpanded, loading]);

  const debouncedSearchTerm = useDebounce(search, 250);

  useEffect(
    () => {
      if (typeof debouncedSearchTerm !== 'undefined') {
        onSearch?.(debouncedSearchTerm);
      }
    },
    [debouncedSearchTerm, onSearch], // Only call effect if debounced search term changes
  );

  const prevIndex = usePrevious(pageIndex) || 0;

  React.useEffect(() => {
    if (!data.length && !loading && prevIndex > 0) {
      gotoPage(prevIndex - 1);
    }
  }, [data, gotoPage, loading, prevIndex]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(event.target.value);

  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const handleSearchBlur = (event: React.FocusEvent<any>) => {
    const currentTarget = event.currentTarget;

    // Check the newly focused element in the next tick of the event loop
    timeoutIdRef.current = setTimeout(() => {
      // Check if the new activeElement is a child of the original container
      if (!currentTarget.contains(document.activeElement)) {
        // You can invoke a callback or add custom logic here
        setSearchActive(false);
      }
    }, 0);
  };

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const handleConfirmRemove = () => {
    if (idRef?.current) {
      onRemove?.(idRef.current);
    }
    onCancelRemove();
  };

  return (
    <React.Fragment>
      <Card flexDirection="column" width="full">
        <Stack isInline bg="gray.100" pos="relative" p={2} roundedTop="lg">
          {onSearch ? (
            <InputGroup
              flex={1}
              mr={2}
              role="group"
              onFocus={() => setSearchActive(true)}
              onBlur={handleSearchBlur}
            >
              <InputLeftElement
                children={<Icon name="search" color="gray.300" />}
              />
              <Input
                bg="gray.100"
                cursor="pointer"
                rounded="lg"
                border={0}
                size="sm"
                fontSize="sm"
                placeholder={
                  searchPlaceholder ? searchPlaceholder : 'Search...'
                }
                _focus={{
                  shadow: 'md',
                  cursor: 'text',
                  bg: 'white',
                }}
                _hover={{ borderColor: 'inherit' }}
                value={search || ''}
                onChange={handleSearchChange}
                onFocus={() => setSearchActive(true)}
              />
              {search && isSearchActive && (
                <InputRightElement
                  children={
                    <IconButton
                      variant="ghost"
                      isRound
                      size="sm"
                      icon="small-close"
                      aria-label="clear search"
                      color="gray.300"
                      onClick={() => setSearch('')}
                    />
                  }
                />
              )}
            </InputGroup>
          ) : (
            <Box flex={1} aria-hidden />
          )}
          {filters}
          <Stack isInline spacing={2} align="center">
            {onAdd && (
              <Button variantColor="blue" size="sm" onClick={onAdd}>
                {addButtonText ? addButtonText : 'Add new'}
              </Button>
            )}
          </Stack>
        </Stack>
        {/* This is required to make the table full-width */}
        <Box
          maxW="full"
          display="block"
          overflowX={isFormOpen ? 'visible' : 'scroll'}
          overflowY={isFormOpen ? 'visible' : 'hidden'}
          css={{
            '::-webkit-scrollbar': {
              width: 0,
              height: 0,
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          roundedBottom={!onPaginate ? 'lg' : undefined}
        >
          <Box
            as="table"
            // Make sure the inner table is always as wide as needed
            w="full"
            {...(getTableProps() as any)}
          >
            <TableHead>
              {headerGroups.map((headerGroup) => (
                <TableRow {...(headerGroup.getHeaderGroupProps() as any)}>
                  {headerGroup.headers.map((column) => {
                    const isExpandable = column.id === 'expander';
                    return (
                      <TableCell
                        bg="gray.100"
                        w={
                          !isExpandable && !column.collapse ? '1%' : '0.1%'
                          // : '0.0000000001%'
                        }
                        {...(column.getHeaderProps() as any)}
                        // {...column.getSortByToggleProps()}
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="medium"
                          textAlign={
                            column.type === 'boolean'
                              ? 'center'
                              : column.align || 'left'
                          }
                        >
                          {column.render('Header')}
                        </Text>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <FiChevronDown size={20} />
                          ) : (
                            <FiChevronUp size={20} />
                          )
                        ) : (
                          ''
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>

            {form && isFormOpen && (
              <TableBody>
                <TableRow _hover={undefined}>
                  <TableCell
                    colSpan={visibleColumns.length}
                    p={0}
                    fontSize="inherit"
                  >
                    <Card
                      p={10}
                      mx={-2}
                      boxShadow="0 1px 2px 0 rgba(60,64,67,.30), 0 2px 6px 2px rgba(60,64,67,.15)"
                    >
                      {form}
                    </Card>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
            <TableBody>
              <AnimatePresence exitBeforeEnter>
                {loading && page.length > 0 && (
                  <TableRow>
                    <TableCell p={0} colSpan={visibleColumns.length}>
                      <LinearProgressBar key="progress" />
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
              {page.map((row, key) => {
                prepareRow(row);
                return (
                  <React.Fragment key={key}>
                    <TableRow
                      onClick={() => {
                        if (isSelectable) {
                          row.toggleRowSelected();
                          // onSelectRow?.(row.id);
                        }
                      }}
                      // Merge user row props in
                      {...(row.getRowProps(getRowProps(row) as any) as any)}
                      role="group"
                      isSelected={row.isSelected}
                    >
                      {row.cells.map((cell) => {
                        const isEditable =
                          typeof cell.column.editable === 'undefined' ||
                          cell.column.editable;
                        const isText =
                          typeof cell.column.editable === 'undefined' ||
                          cell.column.type === 'string';

                        const isExpandable = cell.column.id === 'expander';
                        const textAlign = cell.column.align || 'left';

                        return (
                          <TableCell
                            w={
                              isText && !isExpandable && !cell.column.collapse
                                ? '1%'
                                : '0.1%'
                            }
                            _last={hasActions ? { w: '0.1%', p: 0 } : undefined}
                            whiteSpace="nowrap"
                            textAlign={textAlign}
                            bg={cell.isPlaceholder ? 'gray.100' : undefined}
                            {...(cell.getCellProps() as any)}
                          >
                            {cell.isPlaceholder
                              ? null
                              : cell.render('Cell', {
                                  editable: isEditable,
                                  type: cell.column.type,
                                })}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {row.isExpanded ? (
                      <TableRow>
                        <TableCell p={0} colSpan={visibleColumns.length}>
                          {renderRowSubComponent?.({ row: row.original })}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                );
              })}
              {loading && page.length === 0 ? (
                [...Array(pageSize)].map((_, i) => {
                  return (
                    <TableRow key={i} _hover={undefined}>
                      {columns.map((col, j) => {
                        return (
                          <TableCell key={col.id || j}>
                            <Skeleton h={5} />
                          </TableCell>
                        );
                      })}
                      {hasActions && (
                        <TableCell _last={{ w: '0.5%' }}>
                          <Skeleton h={5} />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : page.length === 0 ? (
                <TableRow _hover={undefined}>
                  <TableCell
                    textAlign="center"
                    p={4}
                    rowSpan={pageSize}
                    colSpan={hasActions ? columns.length + 1 : columns.length}
                  >
                    <Text fontSize="sm">{noDataMessage || 'No Data'}</Text>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Box>
        </Box>
        {onPaginate && (
          <TablePagination
            justifyContent="space-between"
            flexDirection="row"
            roundedBottom="lg"
          >
            <Stack isInline spacing={2}>
              <TableIconButton
                onClick={() => gotoPage(0)}
                isDisabled={!canPreviousPage}
                icon={() => <FiChevronsLeft size={20} />}
              />
              <TableIconButton
                isDisabled={!canPreviousPage}
                onClick={() => previousPage()}
                icon={() => <FiChevronLeft size={20} />}
              />
            </Stack>
            <Stack isInline flexWrap="nowrap" justify="center" align="center">
              <Text whiteSpace="nowrap" fontSize="xs">
                Page {pageIndex + 1} of {pageOptions.length}
              </Text>
              <Select
                size="sm"
                icon="arrow-up-down"
                iconSize={3}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                }}
                isDisabled={loading}
              >
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </Select>
            </Stack>
            <Stack isInline spacing={2}>
              <TableIconButton
                isDisabled={!canNextPage}
                onClick={() => nextPage()}
                icon={() => <FiChevronRight size={20} />}
              />
              <TableIconButton
                onClick={() => gotoPage(pageCount ? pageCount - 1 : 1)}
                isDisabled={!canNextPage}
                icon={() => <FiChevronsRight size={20} />}
              />
            </Stack>
          </TablePagination>
        )}
      </Card>
      <PromptDialog
        title={removeTitle!}
        message={removeMessage || ''}
        isOpen={isRemoveAlertOpen}
        onCancel={onCancelRemove}
        onConfirm={handleConfirmRemove}
      />
    </React.Fragment>
  );
};

export default Table;
