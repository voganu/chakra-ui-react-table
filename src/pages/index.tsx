import { LightMode, useDisclosure } from '@chakra-ui/core';
import * as React from 'react';
import { Column } from 'react-table';

import { Container } from '../components/Container';
import Table from '../components/Table/Table';

const ROWS_PER_PAGE = 10;

const Index = () => {
  const [state, setState] = React.useState({ data: [], loading: true });
  const [pagination, setPagination] = React.useState({
    page: 0,
    rowsPerPage: ROWS_PER_PAGE,
  });
  const [search, setSearch] = React.useState<string | undefined>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const columns: Column[] = React.useMemo(
    () => [
      {
        Header: 'First Name',
        accessor: 'first_name',
        editable: true,
      },
      {
        Header: 'Last Name',
        accessor: 'last_name',
        editable: true,
      },
      {
        Header: 'Email',
        accessor: 'email',
        editable: false,
        collapse: true,
      },
      {
        Header: 'Active',
        type: 'boolean',
        accessor: 'active',
        collapse: true,
      },
    ],
    [],
  );

  React.useEffect(() => {
    function fetchData() {
      setState((state) => ({
        ...state,
        loading: true,
      }));
      fetch(
        `https://random-data-api.com/api/users/random_user?size=${pagination.rowsPerPage}`,
      )
        .then((res) => res.json())
        .then((data) => {
          setState({ data, loading: false });
        });
    }
    fetchData();
  }, [pagination]);

  const handlePagination = React.useCallback(({ pageSize, pageIndex }) => {
    setPagination({ page: pageIndex, rowsPerPage: pageSize });
  }, []);

  const handleSearch = (searchText: string) => {
    console.log('search', searchText);
    setSearch(searchText);
  };

  const handleRemove = async (id: string) => {
    console.log('delete', id);
  };

  const handleEdit = (id: string) => {
    console.log('edit', id);
  };

  const handleClone = (id: string) => {
    console.log('clone', id);
  };

  const handleUpdateData = async (id: string, field: string, value: any) => {
    console.log('update data', id, field, value);
  };

  return (
    <LightMode>
      <Container minH="100vh" p={8}>
        <Table
          columns={columns}
          data={state.data}
          loading={state.loading}
          totalCount={state.data.length} // this should be the total amount of data, not only the returned data length
          onPaginate={handlePagination}
          initialPageIndex={pagination.page}
          initialPageSize={pagination.rowsPerPage}
          onSearch={handleSearch}
          initialSearch={search}
          searchPlaceholder={'Search by...'}
          onAdd={onOpen}
          onRemove={handleRemove}
          onEdit={handleEdit}
          onClone={handleClone}
          onUpdateData={handleUpdateData}
          isSelectable={false}
        />
      </Container>
    </LightMode>
  );
};

export default Index;
