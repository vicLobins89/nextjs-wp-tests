(() => {
	/**
	 * Initialize Block.
	 * @param { Node } block Gutenberg block element.
	 */
	const initializeBlock = block => {
		console.log(block);
	};

	// Initialize each block on page load (front end).
  if (typeof window !== "undefined") {
    document.querySelectorAll('.dynamic-post-block').forEach(element => initializeBlock(element));
  }
})();
