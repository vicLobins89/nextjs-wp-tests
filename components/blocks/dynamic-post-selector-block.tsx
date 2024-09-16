import useEmblaCarousel from 'embla-carousel-react'
import { useState, useEffect, useCallback } from "react"
import PostCard from "../parts/post-card";
import PostCardById from "../parts/post-card-by-id";
import '../../src/scripts/dynamic-post-selector-block';

export default function DynamicPostSelectorBlock({
  className,
  selectedPosts,
  customPosts,
  posts
}) {
  const postsArray = customPosts ? JSON.parse(customPosts) : JSON.parse(selectedPosts);

  // Set up embla.
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
    inViewThreshold: 0.7,
    container: customPosts ? 'clarity' : 'custom',
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => embla && embla.scrollTo(index),
    [embla]
  );

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
  }, [embla, setSelectedIndex]);

  const scrollPrev = useCallback(() => {
    if (embla) embla.scrollPrev();
  }, [embla]);
  const scrollNext = useCallback(() => {
    if (embla) embla.scrollNext();
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    setScrollSnaps(embla.scrollSnapList());
    embla.on("select", onSelect);
  }, [embla, setScrollSnaps, onSelect]);

  return (
    <div className={`py-12 mx-auto max-w-6xl px-5 ${
      customPosts ? 'clarity' : 'custom'
    }`}>
      <div className="flex justify-center items-center pb-10">
        <h2 className="text-center text-black dark:text-gray-100 text-4xl font-bold">
          Posts Slider
        </h2>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {postsArray &&
            postsArray.map((postId, index) => <PostCardById key={index} postId={postId} />)
          }
          {/* {posts &&
            posts.edges.map((post, index) => <PostCard post={post.node} key={index} />)
          } */}
        </div>
      </div>

      <div className="buttons flex justify-between">
        <button
          className="p-5 rounded-lg"
          type="button"
          onClick={scrollPrev}
        >Previous</button>

        <button
          className="p-5 rounded-lg"
          type="button"
          onClick={scrollNext}
        >Next</button>
      </div>

      <div className="flex items-center justify-center mt-5 space-x-2">
        {scrollSnaps.map((el, idx) => (
          <button
            className={`w-2 h-2 rounded-full ${
              idx === selectedIndex ? "bg-yellow-500" : "bg-gray-300"
            }`}
            key={idx}
            onClick={() => scrollTo(idx)}
          />
        ))}
      </div>
    </div>
  );
}