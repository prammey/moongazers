// Markdown ignores a single newline, so pressing Enter once in the admin
// editor had no visible effect. This turns each newline inside a paragraph
// into a line break (what the remark-breaks package does). Code blocks are
// separate node types, so they're left alone.
type MdNode = { type: string; value?: string; children?: MdNode[] };

export default function remarkSoftBreaks() {
  const walk = (node: MdNode) => {
    if (!node.children) return;
    node.children = node.children.flatMap((child) => {
      if (child.type === 'text' && child.value?.includes('\n')) {
        return child.value
          .split(/\r?\n/)
          .flatMap((part, i) => [
            ...(i > 0 ? [{ type: 'break' }] : []),
            { type: 'text', value: part },
          ]);
      }
      walk(child);
      return [child];
    });
  };
  return (tree: MdNode) => walk(tree);
}
