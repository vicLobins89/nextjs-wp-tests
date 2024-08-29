import PostCard from "../parts/post-card";
import '../../src/scripts/dynamic-post-selector-block';

export default function DynamicPostSelectorBlock({
  className,
  posts
}) {
  className = className ?? 'dynamic-post-block'

  return (
    <article className={className}>
      {posts &&
        posts.edges.map((post, index) => <PostCard post={post.node} key={index} />)
      }
    </article>
  );
}