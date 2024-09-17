
import { NetworkStatus } from '@apollo/client';
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

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
  // TODO: Updating URL appends the results..
  router.push(
    {
      pathname: '/blog',
      query: { [key]: value },
    },
    `/blog?${key}=${value}`,
    { shallow: true }
  );
};

const SearchBox = ({fetchMore}) => {
  const [searchText, setSearchText] = useState('');

  return (
    <input
      value={searchText}
      placeholder="Search..."
      onChange={e => {
        setSearchText(e.target.value);
        fetchMore({
          variables: {
            search: e.target.value,
            after: null,
            before: null,
          }
        });
      }}
    />
  );
};

const TaxonomyDropdown = ({fetchMore}) => {
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
      onChange={(event) => {
        fetchMore({
          variables: {
            categoryName: event.target.value,
            after: null,
            before: null,
          }
        });
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
              <button
                className='rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600'
                onClick={() => {
                  updateUrl('prev', posts.pageInfo.startCursor, router);
                  fetchMore({
                    variables: {
                      first: null,
                      after: null,
                      last: 5,
                      before: posts.pageInfo.startCursor || null
                    },
                    updateQuery
                  });
                }}
              >
                Previous
              </button>
            ) : null}

            {posts.pageInfo.hasNextPage ? (
              <button
                className='rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600'
                onClick={() => {
                  updateUrl('next', posts.pageInfo.endCursor, router);
                  fetchMore({
                    variables: {
                      first: 5,
                      after: posts.pageInfo.endCursor || null,
                      last: null,
                      before: null
                    },
                    updateQuery
                  });
                }}
              >
                Next
              </button>
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
  const searchParams = useSearchParams();
  const prevPage = searchParams.get('prev') ?? null;
  const nextPage = searchParams.get('next') ?? null;
  // const variables = {
  //   first: prevPage ? null : BATCH_SIZE,
  //   last: prevPage ? BATCH_SIZE : null,
  //   after: nextPage,
  //   before: prevPage
  // };
  const variables = {
    first: BATCH_SIZE,
    after: null,
  };
  const { data, error, loading, networkStatus, fetchMore } = useQuery(GET_POSTS, {
    variables,
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
