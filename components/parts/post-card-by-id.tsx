import { gql, useQuery } from "@apollo/client";
import parseHtml from "../../lib/parser";
import Image from "next/image";
import Link from "next/link";

const GET_POST = gql`
query GetPost($id: ID!) {
  post(id: $id, idType: DATABASE_ID) {
    id
    excerpt
    featuredImage {
      node {
        sourceUrl(size: MEDIUM_LARGE)
        altText
        mediaDetails {
          sizes {
            height
            width
            name
          }
        }
      }
    }
    uri
    title
  }
}
`;

export default function PostCardById({postId}) {
  // Ensure we have the post data.
  const { data, loading, error } = useQuery(GET_POST, {
    variables: { id: postId },
    notifyOnNetworkStatusChange: true,
  });

  if (error) {
    return <p>Sorry, an error happened. Reload Please</p>;
  }

  if (!data && loading) {
    return <p>Loading...</p>;
  }

  // Set up post vars, featured image.
  const { title, excerpt, featuredImage, uri } = data.post;
  const ftSize = {
    width: null,
    height: null,
  };
  if (featuredImage) {
    featuredImage.node.mediaDetails.sizes.map(size => {
      if (size.name === "medium_large") {
        ftSize.width = size.width;
        ftSize.height = size.height;
      }
    })
  }

  return (
    <div
      className="relative flex flex-none flex-wrap lg:flex-nowrap w-full mx-10"
      key={title}
    >
      <Link href={uri} className="post-card">
        <h3>{title}</h3>
        <div className="excerpt">{parseHtml(excerpt)}</div>
        {featuredImage &&
          (
            <Image
              src={featuredImage.node.sourceUrl}
              width={ftSize.width}
              height={ftSize.height}
              alt={featuredImage.node.altText}
            />
          )  
        }
      </Link>
    </div>
  );
}
