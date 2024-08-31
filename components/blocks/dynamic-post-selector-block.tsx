import PostCard from "../parts/post-card";
import PostCardById from "../parts/post-card-by-id";
import '../../src/scripts/dynamic-post-selector-block';

export default function DynamicPostSelectorBlock({
  className,
  selectedPosts,
  posts
}) {
  className = className ?? 'dynamic-post-block'
  const postsArray = JSON.parse(selectedPosts);

  return (
    <div className={className}>
      {postsArray &&
        postsArray.map((postId, index) => <PostCardById key={index} postId={postId} />)
      }
      {/* {posts &&
        posts.edges.map((post, index) => <PostCard post={post.node} key={index} />)
      } */}
    </div>
  );
}