/**
 * Custom ESLint plugin: import-sort
 *
 * Enforces import ordering rules:
 * 1. Default imports (no {}) sorted by line length (shortest first)
 * 2. Mixed imports (default + {named}) at end of default group
 * 3. Named imports (with {} only) sorted by line length (shortest first)
 * 4. No blank lines between groups — all imports in one continuous block
 * 5. Preserves "use client"/"use server" directives at top
 *
 * Only processes contiguous import blocks (ignores non-import code between imports).
 */

function classifyImport(node) {
  const specifiers = node.specifiers || [];
  if (specifiers.length === 0) {
    return "side-effect";
  }

  const hasDefault = specifiers.some((s) => s.type === "ImportDefaultSpecifier");
  const hasNamed = specifiers.some((s) => s.type === "ImportSpecifier");
  const hasNamespace = specifiers.some(
    (s) => s.type === "ImportNamespaceSpecifier",
  );

  if (hasNamespace) {
    return "default";
  }
  if (hasDefault && hasNamed) {
    return "mixed";
  }
  if (hasDefault) {
    return "default";
  }
  return "named";
}

function getImportText(sourceCode, node) {
  return sourceCode.getText(node);
}

function getLineLength(sourceCode, node) {
  return getImportText(sourceCode, node).length;
}

/**
 * Split import nodes into contiguous groups.
 * A group breaks when there's a non-import statement between two imports.
 */
function getContiguousImportGroups(body) {
  const groups = [];
  let currentGroup = [];

  for (const node of body) {
    if (node.type === "ImportDeclaration") {
      currentGroup.push(node);
    } else if (currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function sortImportGroup(sourceCode, importNodes) {
  const sideEffects = importNodes.filter(
    (n) => classifyImport(n) === "side-effect",
  );
  const defaultImports = importNodes.filter(
    (n) => classifyImport(n) === "default",
  );
  const mixedImports = importNodes.filter(
    (n) => classifyImport(n) === "mixed",
  );
  const namedImports = importNodes.filter(
    (n) => classifyImport(n) === "named",
  );

  const sortByLength = (a, b) =>
    getLineLength(sourceCode, a) - getLineLength(sourceCode, b);

  return [
    ...sideEffects,
    ...[...defaultImports].sort(sortByLength),
    ...[...mixedImports].sort(sortByLength),
    ...[...namedImports].sort(sortByLength),
  ];
}

const rule = {
  meta: {
    type: "layout",
    docs: {
      description:
        "Enforce import ordering: default (by length) → mixed → named (by length), no blank lines",
    },
    fixable: "code",
    schema: [],
    messages: {
      incorrectOrder: "Imports are not ordered correctly.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    return {
      Program(node) {
        const groups = getContiguousImportGroups(node.body);

        for (const importNodes of groups) {
          if (importNodes.length <= 1) continue;

          const sorted = sortImportGroup(sourceCode, importNodes);

          const currentTexts = importNodes.map((n) =>
            getImportText(sourceCode, n),
          );
          const expectedTexts = sorted.map((n) =>
            getImportText(sourceCode, n),
          );

          const orderCorrect = currentTexts.every(
            (t, i) => t === expectedTexts[i],
          );

          // Check for blank lines between imports in this group
          let hasBlankLines = false;
          for (let i = 0; i < importNodes.length - 1; i++) {
            const currentEnd = importNodes[i].loc.end.line;
            const nextStart = importNodes[i + 1].loc.start.line;
            if (nextStart - currentEnd > 1) {
              hasBlankLines = true;
              break;
            }
          }

          if (orderCorrect && !hasBlankLines) continue;

          context.report({
            node: importNodes[0],
            messageId: "incorrectOrder",
            fix(fixer) {
              const firstImport = importNodes[0];
              const lastImport = importNodes[importNodes.length - 1];

              const rangeStart = firstImport.range[0];
              const rangeEnd = lastImport.range[1];

              const newImportBlock = expectedTexts.join("\n");

              return fixer.replaceTextRange(
                [rangeStart, rangeEnd],
                newImportBlock,
              );
            },
          });
        }
      },
    };
  },
};

const plugin = {
  meta: {
    name: "eslint-plugin-import-sort",
    version: "1.0.0",
  },
  rules: {
    order: rule,
  },
};

export default plugin;
