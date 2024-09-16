
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

// Function to update the query with the new results
const updateQuery = (previousResult, { fetchMoreResult }) => {
  return fetchMoreResult.posts.edges.length ? fetchMoreResult : previousResult;
};

const PostList = ({ data, error, loading, fetchMore }) => {
  const { posts } = data;

  return (
    <div>
      <h2>Post List</h2>
      {posts && posts.edges ? (
        <div>
          <ul>
            {posts.edges.map(edge => {
              const { node } = edge;
              return (
                <li
                  key={node.id}
                  dangerouslySetInnerHTML={{ __html: node.title }}
                />
              );
            })}
          </ul>
          <div>
            {posts.pageInfo.hasPreviousPage ? (
              <button
                onClick={() => {
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
                onClick={() => {
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
  const variables = {
    first: prevPage ? null : BATCH_SIZE,
    last: prevPage ? BATCH_SIZE : null,
    after: nextPage,
    before: prevPage
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
    <PostList
      error={error}
      loading={loading}
      data={data}
      fetchMore={fetchMore}
    />
  );
};

export default () => <LoadPosts />;
