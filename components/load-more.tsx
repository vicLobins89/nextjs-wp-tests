
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

export default function LoadMorePost() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const prevPage = searchParams.get('prev') ?? null;
  const nextPage = searchParams.get('next') ?? null;
  const variables = {
    first: prevPage ? null : BATCH_SIZE,
    last: prevPage ? BATCH_SIZE : null,
    after: nextPage,
    before: prevPage
  };

  const { data, loading, error, networkStatus, fetchMore, refetch } = useQuery(GET_POSTS, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const cats = useQuery(GET_CATS);

  if (networkStatus === NetworkStatus.refetch) {
    return <p>Refetching!</p>;
  }

  if (error) {
    return <p>Sorry, an error happened. Reload Please</p>;
  }

  if (!data && loading) {
    return <p>Loading...</p>;
  }

  if (!data?.posts.edges.length) {
    return <p>No posts have been published</p>;
  }

  const updateQuery = (previousResult, { fetchMoreResult }) => {
    console.log(fetchMoreResult);
    return fetchMoreResult.posts.edges.length ? fetchMoreResult : previousResult;
  };

  const loadMore = (dir, cursor = null) => {
    const isPrev = dir === 'prev';
    
    router.push(
      {
        pathname: '/blog',
        query: { [dir]: cursor },
      },
      `/blog?${dir}=${cursor}`,
      { shallow: true }
    );

    const variables = {
      first: !isPrev ? BATCH_SIZE : null,
      after: !isPrev ? (cursor || null) : null,
      last: isPrev ? BATCH_SIZE : null,
      before: isPrev ? (cursor || null) : null,
    };

    fetchMore({
      variables,
      updateQuery
    });
  };

  const { posts } = data;
  const hasNextPage = Boolean(data?.posts?.pageInfo?.hasNextPage);
  const hasPrevPage = Boolean(data?.posts?.pageInfo?.hasPreviousPage);
  const categories = cats.data ? cats.data.categories.edges.map((edge) => edge.node) : [];
  const pagination = true;

  return (
    <>
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

      {posts && posts.edges ? (
        <div>
          <ul style={{ padding: "0" }}>
            {posts.edges.map((edge) => {
              const { databaseId, title, slug } = edge.node;
              return (
                <li
                  key={databaseId}
                  style={{
                    border: "2px solid #ededed",
                    borderRadius: "10px",
                    padding: "2rem",
                    listStyle: "none",
                    marginBottom: "1rem",
                  }}
                >
                  <Link href={`/posts/${slug}`}>{title}</Link>
                </li>
              );
            })}
          </ul>

          {pagination ? (
            <div className="pagination flex justify-center">
              {hasPrevPage &&
                <button
                  className="rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600"
                  type="button"
                  value={posts.pageInfo.startCursor}
                  disabled={loading}
                  onClick={() => loadMore('prev', posts.pageInfo.startCursor)}
                >
                  {loading ? "Loading..." : "Previous"}
                </button>
              }

              {hasNextPage &&
                <button
                  className="rounded-lg shadow-lg px-5 mx-2 py-1 border-solid border-2 border-gray-600"
                  type="button"
                  value={posts.pageInfo.endCursor}
                  disabled={loading}
                  onClick={() => loadMore('next', posts.pageInfo.endCursor)}
                >
                  {loading ? "Loading..." : "Next"}
                </button>
              }
            </div>
          ) : (
            <div className="load-more">
              {hasNextPage ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    fetchMore({ variables: { after: posts.pageInfo.endCursor } });
                  }}
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              ) : (
                <p>✅ All posts loaded.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p>None found.</p>
      )}
    </>
  );
}