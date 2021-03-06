import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { services } from '../../services';
import { ProductSortKeys } from '../../types/shopify.type';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '30px 0',
    textAlign: 'center'
  }
}));

interface Props {
  cursor: string;
  hasNextpage: boolean;
  loading: boolean;
  error: Error;
  dispatch: Function;
  query: {
    query: string;
    reverse: boolean;
    sortKey: ProductSortKeys;
    sortIndex: number;
  };
}

function LoadMore({ cursor, hasNextpage, loading, error, dispatch, query }: Props) {
  const theme = useTheme();
  const classes = useStyles(theme);

  function _load() {
    dispatch(
      services.products.getNextPage({
        cursor,
        ...query
      })
    );
  }

  if (loading) {
    return (
      <div className={classes.root}>
        <CircularProgress size={24} />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Button variant="contained" color={error ? 'secondary' : 'primary'} disabled={!hasNextpage} onClick={_load}>
        {error ? 'Try Again' : 'Load More'}
      </Button>
    </div>
  );
}

export default LoadMore;
