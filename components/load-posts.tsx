
import { NetworkStatus } from '@apollo/client';
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const GET_POSTS = gql`
  query getPosts(
    $first: Int,
    $last: Int,
    $after: String,
    $before: String,
    $categoryName: String,
    $search: String
  ) {
    posts(
      first: $first,
      last: $last,
      after: $after,
      before: $before,
      where: {categoryName: $categoryName, , search: $search}
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          databaseId
          title
          slug
        }
      }
    }
  }
`;

const BATCH_SIZE = 5;

const GET_CATS = gql`
  query GetCategories {
    categories(first: 100) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const updateQuery = (previousResult, { fetchMoreResult }) => {
  return fetchMoreResult.posts.edges.length ? fetchMoreResult : previousResult;
};

const updateUrl = (key, value, router) => {
  router.push(
    {
      pathname: '/blog',
      query: { ...router.query, [key]: value },
    },
    undefined,
    { shallow: true }
  );
};

const SearchBox = ({fetchMore, isSearched, onSearch, filterTerm}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchText, setSearchText] = useState(isSearched);

  return (
    <div className='max-w-md'>
      <input
        className='block w-full h-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        value={searchText}
        placeholder="Search..."
        onChange={e => {
          setSearchText(e.target.value);
          fetchMore({
            variables: {
              search: e.target.value,
              categoryName: filterTerm,
              first: BATCH_SIZE,
              last: null,
              after: null,
              before: null,
            }
          });
          onSearch(e.target.value);
          // updateUrl('search', e.target.value, router);
        }}
      />
    </div>
  );
};

const TaxonomyDropdown = ({fetchMore, isFiltered, onFilter, searchTerm}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState(isFiltered);
  const { data, loading, error } = useQuery(GET_CATS);

  if (error) {
    return <p>Sorry, an error happened. Reload Please</p>;
  }

  if (!data && loading) {
    return <p>Loading...</p>;
  }

  const categories = data.categories.edges ? data.categories.edges.map((edge) => edge.node) : [];

  return (
    <div className='max-w-lg'>
      <select
        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        value={category}
        onChange={(event) => {
          setCategory(event.target.value);
          fetchMore({
            variables: {
              categoryName: event.target.value,
              search: searchTerm,
              first: BATCH_SIZE,
              last: null,
              after: null,
              before: null,
            }
          });
          onFilter(event.target.value);
          // updateUrl('category', event.target.value, router);
        }}>
        <option value="">Show All</option>
        {categories.map(o => (
          <option key={o.id} value={o.name}>{o.name}</option>
        ))}
      </select>
    </div>
  );
};

const PostList = ({ data, fetchMore, filterTerm, searchTerm }) => {
  const router = useRouter();
  const { posts } = data;
  const { query } = router;
  delete query.next;
  delete query.prev;

  return (
    <div>
      <h2 className='text-xl my-5 font-bold'>Post List</h2>
      {posts && posts.edges ? (
        <div>
          <ul>
            {posts.edges.map(edge => {
              const { node } = edge;
              return (
                <li
                  key={node.id}
                  className='border-solid rounded-lg px-5 py-2 my-2 border-2 border-gray-500'
                >
                  <Link href={`/posts/${node.slug}`}>{node.title}</Link>
                </li>
              );
            })}
          </ul>

          <div className="pagination flex justify-center">
            {posts.pageInfo.hasPreviousPage ? (
              <>
                {/* <Link
                  className='rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600'
                  href={{
                    pathname: router.pathname,
                    query: { ...router.query, prev: posts.pageInfo.startCursor }
                  }}
                  passHref
                  shallow
                  replace
                  onClick={() => {
                    fetchMore();
                  }}
                >Previous</Link> */}
                <button
                  className='rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600'
                  onClick={() => {
                    fetchMore({
                      variables: {
                        first: null,
                        after: null,
                        last: BATCH_SIZE,
                        before: posts.pageInfo.startCursor || null,
                        categoryName: filterTerm,
                        search: searchTerm,
                      },
                      updateQuery
                    });
                    // updateUrl('prev', posts.pageInfo.startCursor, router);
                  }}
                >
                  Previous
                </button>
              </>
            ) : null}

            {posts.pageInfo.hasNextPage ? (
              <>
                {/* <Link
                  className='rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600'
                  href={{
                    pathname: router.pathname,
                    query: { ...router.query, next: posts.pageInfo.endCursor }
                  }}
                  passHref
                  shallow
                  replace
                  onClick={() => {
                    fetchMore();
                  }}
                >Next</Link> */}
                <button
                  className='rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600'
                  onClick={() => {
                    fetchMore({
                      variables: {
                        first: BATCH_SIZE,
                        after: posts.pageInfo.endCursor || null,
                        last: null,
                        before: null,
                        categoryName: filterTerm,
                        search: searchTerm,
                      },
                      updateQuery
                    });
                    // updateUrl('next', posts.pageInfo.endCursor, router);
                  }}
                >
                  Next
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div>No posts were found...</div>
      )}
    </div>
  );
};

const LoadPosts = () => {
  const [fetchVars, setFetchVars] = useState({
    first: BATCH_SIZE,
    after: null,
  });
  const [activeFilter, setFilter] = useState('');
  const [activeSearch, setSearch] = useState('');
  
  const searchParams = useSearchParams();
  useEffect(() => {
    const prevPage = searchParams.get('prev') ?? null;
    const nextPage = searchParams.get('next') ?? null;
    const variables = {
      first: prevPage ? null : BATCH_SIZE,
      after: nextPage,
      last: prevPage ? BATCH_SIZE : null,
      before: prevPage,
    };

    if (prevPage || nextPage) {
      setFetchVars(variables);
    }
  }, [searchParams]);

  const { data, error, loading, networkStatus, fetchMore } = useQuery(GET_POSTS, {
    variables: fetchVars,
    notifyOnNetworkStatusChange: true,
  });

  if (networkStatus === NetworkStatus.refetch) {
    return <p>Refetching!</p>;
  }

  if (error) {
    return <p>Sorry, an error happened. Reload Please</p>;
  }

  if (!data && loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="flex justify-between align-middle max-w-fit gap-2">
        <SearchBox
          fetchMore={fetchMore}
          isSearched={activeSearch}
          onSearch={value => setSearch(value)}
          filterTerm={activeFilter}
        />
        <TaxonomyDropdown
          fetchMore={fetchMore}
          isFiltered={activeFilter}
          onFilter={value => setFilter(value)}
          searchTerm={activeSearch}
        />
      </div>
      <PostList
        data={data}
        fetchMore={fetchMore}
        filterTerm={activeFilter}
        searchTerm={activeSearch}
      />
      {/* <PostList
        data={data}
        fetchMore={fetchMore}
      /> */}
    </>
  );
};

export default () => <LoadPosts />;
