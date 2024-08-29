import Image from "next/image";
import Link from "next/link";
import parseHtml from "../../lib/parser";

export default function PostCard({post}) {
  const { title, excerpt, featuredImage, uri } = post;

  if (featuredImage) {
    featuredImage.node.mediaDetails.sizes.map(size => {
      if (size.name === "medium_large") {
        featuredImage.node.width = size.width;
        featuredImage.node.height = size.height;
      }
    })
  }
  

  return (
    <Link href={uri} className="post-card">
      <h3>{title}</h3>
      <div className="excerpt">{parseHtml(excerpt)}</div>
      {featuredImage &&
        (
          <Image
            src={featuredImage.node.sourceUrl}
            width={featuredImage.node.width}
            height={featuredImage.node.height}
            alt={featuredImage.node.altText}
          />
        )  
      }
    </Link>
  );
}
