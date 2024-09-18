
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

const SearchBox = ({fetchMore}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchText, setSearchText] = useState(searchParams.get('search'));

  return (
    <input
      value={searchText}
      placeholder="Search..."
      onChange={e => {
        setSearchText(e.target.value);
        fetchMore({
          variables: {
            search: e.target.value,
            categoryName: searchParams.get('category') ?? null,
            first: BATCH_SIZE,
            last: null,
            after: null,
            before: null,
          }
        });
        updateUrl('search', e.target.value, router);
      }}
    />
  );
};

const TaxonomyDropdown = ({fetchMore}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState(searchParams.get('category'));
  const { data, loading, error } = useQuery(GET_CATS);

  if (error) {
    return <p>Sorry, an error happened. Reload Please</p>;
  }

  if (!data && loading) {
    return <p>Loading...</p>;
  }

  const categories = data.categories.edges ? data.categories.edges.map((edge) => edge.node) : [];

  return (
    <select
      value={category}
      onChange={(event) => {
        setCategory(event.target.value);
        fetchMore({
          variables: {
            categoryName: event.target.value,
            search: searchParams.get('search') ?? null,
            first: BATCH_SIZE,
            last: null,
            after: null,
            before: null,
          }
        });
        updateUrl('category', event.target.value, router);
      }}>
      <option value="">Show All</option>
      {categories.map(o => (
        <option key={o.id} value={o.name}>{o.name}</option>
      ))}
    </select>
  );
};

const PostList = ({ data, fetchMore }) => {
  const router = useRouter();
  const { posts } = data;
  const { query } = router;
  delete query.next;
  delete query.prev;

  console.log(query);

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
                <Link
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
                >Previous</Link>
                {/* <button
                  className='rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600'
                  onClick={() => {
                    fetchMore({
                      variables: {
                        first: null,
                        after: null,
                        last: BATCH_SIZE,
                        before: posts.pageInfo.startCursor || null
                      },
                      updateQuery
                    });
                    updateUrl('prev', posts.pageInfo.startCursor, router);
                  }}
                >
                  Previous
                </button> */}
              </>
            ) : null}

            {posts.pageInfo.hasNextPage ? (
              <>
                <Link
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
                >Next</Link>
                {/* <button
                  className='rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600'
                  onClick={() => {
                    fetchMore({
                      variables: {
                        first: BATCH_SIZE,
                        after: posts.pageInfo.endCursor || null,
                        last: null,
                        before: null
                      },
                      updateQuery
                    });
                    updateUrl('next', posts.pageInfo.endCursor, router);
                  }}
                >
                  Next
                </button> */}
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
  
  const searchParams = useSearchParams();
  useEffect(() => {
    const prevPage = searchParams.get('prev') ?? null;
    const nextPage = searchParams.get('next') ?? null;
    const variables = {
      first: BATCH_SIZE,
      after: null,
      last: null,
      before: null,
    };

    if (prevPage) {
      variables.first = null;
      variables.after = null;
      variables.last = BATCH_SIZE;
      variables.before = prevPage;
      setFetchVars(variables);
    }
    if (nextPage) {
      variables.first = BATCH_SIZE;
      variables.after = nextPage;
      variables.last = null;
      variables.before = null;
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
      <SearchBox fetchMore={fetchMore} />
      <TaxonomyDropdown fetchMore={fetchMore} />
      <PostList
        data={data}
        fetchMore={fetchMore}
      />
    </>
  );
};

export default () => <LoadPosts />;
