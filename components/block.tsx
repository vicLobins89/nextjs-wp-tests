import ParagraphBlock from "./blocks/paragraph-block";
import DynamicPostSelectorBlock from "./blocks/dynamic-post-selector-block";
import parseHtml from "../lib/parser";

const componentMap = {
  'core/paragraph': ParagraphBlock,
  'create-block/dynamic-post-selector': DynamicPostSelectorBlock,
};

export default function Block({ block }) {
  const { attributes, name, innerBlocks, renderedHtml } = block;
  const BlockComponent = componentMap[name];
  const content = parseHtml(renderedHtml);

  if (!BlockComponent) {
    return <>{content}</>;
  }

  if (innerBlocks) {
    return <BlockComponent attributes={attributes} innerBlocks={innerBlocks} />;
  }

  return <BlockComponent {...attributes} />;
}
