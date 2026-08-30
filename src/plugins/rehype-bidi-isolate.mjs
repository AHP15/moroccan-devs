/**
 * Arabic prose that embeds Latin technical terms is the whole point of this blog, and
 * `dir="rtl"` alone does not survive it. Two things go wrong without help:
 *
 *   1. Code — inline and block — inherits RTL and renders right-aligned and mirrored.
 *   2. A Latin run with trailing punctuation ("راجع serpapi.com/search?q=coffee.") lets the
 *      dot escape to the wrong end of the run, because the Unicode bidi algorithm resolves
 *      neutral characters against the paragraph direction, not the run's.
 *
 * So: force LTR on every code element, and wrap bare Latin runs in <bdi> so each one is an
 * isolated directional island. Running in rehype rather than remark means it covers .md and
 * .mdx alike, and it cannot be forgotten by whoever writes the next post.
 *
 * The walk is hand-rolled rather than using unist-util-visit because it must skip whole
 * subtrees: Shiki has already exploded code blocks into nested <span> elements by the time
 * this runs, so checking only a text node's immediate parent would wrap half of every
 * syntax-highlighted token in <bdi>.
 */

/** Elements whose entire subtree is left alone. */
const SKIP_SUBTREE = new Set(['pre', 'code', 'style', 'script', 'bdi', 'kbd', 'samp']);

/**
 * A run starting with a Latin letter. Punctuation is allowed only *between* alphanumerics,
 * so "serpapi.com/search" is one island while the full stop in "واجهة API." stays outside it —
 * swallowing sentence-final punctuation into the LTR island would strand the period in the
 * middle of the Arabic line instead of at its left edge.
 */
const LATIN_RUN = /[A-Za-z][A-Za-z0-9]*(?:[._/:\-?=&%#@+~]+[A-Za-z0-9]+)*/g;

function splitLatinRuns(text) {
  if (!LATIN_RUN.test(text)) return null;
  LATIN_RUN.lastIndex = 0;

  const out = [];
  let cursor = 0;
  for (const match of text.matchAll(LATIN_RUN)) {
    if (match.index > cursor) out.push({ type: 'text', value: text.slice(cursor, match.index) });
    out.push({
      type: 'element',
      tagName: 'bdi',
      properties: { dir: 'ltr' },
      children: [{ type: 'text', value: match[0] }],
    });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) out.push({ type: 'text', value: text.slice(cursor) });
  return out;
}

function walk(node) {
  if (node.type === 'element') {
    if (node.tagName === 'pre' || node.tagName === 'code') {
      node.properties = { ...node.properties, dir: 'ltr' };
      return;
    }
    if (SKIP_SUBTREE.has(node.tagName)) return;
  }
  if (!Array.isArray(node.children)) return;

  const children = [];
  for (const child of node.children) {
    if (child.type === 'text') {
      const split = splitLatinRuns(child.value);
      if (split) children.push(...split);
      else children.push(child);
    } else {
      walk(child);
      children.push(child);
    }
  }
  node.children = children;
}

export function rehypeBidiIsolate() {
  return (tree) => walk(tree);
}
