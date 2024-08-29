import parseHtml from "../../lib/parser";

const getClassName = align => {
  if (align === 'center' || align === 'right') {
    return `text-${align}`;
  }

  return 'text-left';
}

export default function ParagraphBlock({
  align,
  anchor,
  backgroundColor,
  className,
  content,
  dropCap,
  style,
  textColor,
}) {
  return <p className={getClassName(align)}>{parseHtml(content)}</p>;
}