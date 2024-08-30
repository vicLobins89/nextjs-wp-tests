import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";

const GET_POSTS = gql`
  query getPosts($first: Int!, $after: String, $categoryName: String, $search: String) {
    posts(first: $first, after: $after, where: {categoryName: $categoryName, , search: $search}) {
      pageInfo {
        hasNextPage
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

  const { data, loading, error, fetchMore } = useQuery(GET_POSTS, {
    variables: { first: BATCH_SIZE, after: null },
    notifyOnNetworkStatusChange: true,
  });

  const cats = useQuery(GET_CATS);

  if (error) {
    return <p>Sorry, an error happened. Reload Please</p>;
  }

  if (!data && loading) {
    return <p>Loading...</p>;
  }

  if (!data?.posts.edges.length) {
    return <p>no posts have been published</p>;
  }

  const posts = data.posts.edges.map((edge) => edge.node);
  const haveMorePosts = Boolean(data?.posts?.pageInfo?.hasNextPage);
  const categories = cats.data ? cats.data.categories.edges.map((edge) => edge.node) : {};

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
              after: null
            }
          });
        }}
      />

      <select
        onChange={(event) => {
          fetchMore({
            variables: {
              categoryName: event.target.value,
              after: null
            }
          });
        }}>
        <option value="">Show All</option>
        {categories.map(o => (
          <option key={o.id} value={o.name}>{o.name}</option>
        ))}
      </select>

      <ul style={{ padding: "0" }}>
        {posts.map((post) => {
          const { databaseId, title, slug } = post;
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
      {haveMorePosts ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            fetchMore({ variables: { after: data.posts.pageInfo.endCursor } });
          }}
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      ) : (
        <p>✅ All posts loaded.</p>
      )}
    </>
  );
}