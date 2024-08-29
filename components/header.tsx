import Link from "next/link";

const flatListToHierarchical = (
  data = [],
  { idKey='id', parentKey='parentId', childrenKey='children' } = {}
) => {
  const tree = [];
  const childrenOf = {};
  data.forEach((item) => {
    const newItem = {...item.node};
    const { [idKey]: id, [parentKey]: parentId = 0 } = newItem;
    childrenOf[id] = childrenOf[id] || [];
    newItem[childrenKey] = childrenOf[id];
    parentId
      ? (
          childrenOf[parentId] = childrenOf[parentId] || []
      ).push(newItem)
      : tree.push(newItem);
  });

  return tree;
};

const MenuNode = ({ node, level = 1 }) => {
  const hasChild = node.children && node.children.length > 0;
  const nodeStyle = level === 1 ? { fontWeight: "bold", color: "red" } : {};
  const itemClass = `flex-1 mr-2 menu-item menu-item__level-${level}`;

  return (
    <li className={itemClass}>
      <Link href={node.uri} style={nodeStyle}>{node.label}</Link>

      {hasChild && (
        <ul className="child">
          {node.children.map(item => (
            <MenuNode key={item.id} node={item} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

const Menu = ({ items }) => {
  const hierarchialList = flatListToHierarchical(items);
  return (
    <nav className="menu-header">
      <ul className="top flex">
        {hierarchialList &&
          hierarchialList.map((item, index) => (
            <MenuNode
              key={item.id}
              node={item}
            />
          ))
        }
      </ul>
    </nav>
  );
}

export default function Header({items = []}) {
  return (
    <div>
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight mb-20 mt-8">
        <Link href="/" className="hover:underline">
          Blog
        </Link>
        .
      </h2>

      {items &&
        <Menu items={items} />
      }
    </div>
  );
}
