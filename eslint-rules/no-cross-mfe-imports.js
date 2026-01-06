/**
 * ESLint rule to prevent direct imports between remote MFEs.
 *
 * Remote MFEs should communicate via the event bus, not direct imports.
 * This ensures loose coupling and independent deployability.
 *
 * Forbidden patterns:
 * - web-remote-* importing from another web-remote-*
 * - mobile-remote-* importing from another mobile-remote-*
 * - Any remote importing from another remote package
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct imports between remote MFE packages',
      category: 'Architecture',
      recommended: true,
    },
    messages: {
      noDirectMfeImport:
        'Direct imports between remote MFEs are not allowed. Use the event bus for inter-MFE communication. Importing "{{importPath}}" from a remote MFE package.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Check if current file is in a remote MFE package
    const remotePackagePatterns = [
      /packages\/web-remote-[^/]+\//,
      /packages\/mobile-remote-[^/]+\//,
    ];

    const isInRemotePackage = remotePackagePatterns.some((pattern) =>
      pattern.test(filename)
    );

    // If not in a remote package, this rule doesn't apply
    if (!isInRemotePackage) {
      return {};
    }

    // Get the current package name from the path
    const currentPackageMatch = filename.match(
      /packages\/((?:web|mobile)-remote-[^/]+)\//
    );
    const currentPackage = currentPackageMatch ? currentPackageMatch[1] : null;

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Check for @universal/web-remote-* or @universal/mobile-remote-* imports
        const remoteImportMatch = importPath.match(
          /@universal\/((?:web|mobile)-remote-[^/]+)/
        );

        if (remoteImportMatch) {
          const importedPackage = remoteImportMatch[1];

          // Allow importing from the same package (internal imports)
          if (importedPackage === currentPackage) {
            return;
          }

          // Disallow importing from other remote packages
          context.report({
            node,
            messageId: 'noDirectMfeImport',
            data: {
              importPath,
            },
          });
        }
      },

      // Also check dynamic imports
      CallExpression(node) {
        if (
          node.callee.type === 'Import' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal'
        ) {
          const importPath = node.arguments[0].value;

          if (typeof importPath !== 'string') {
            return;
          }

          const remoteImportMatch = importPath.match(
            /@universal\/((?:web|mobile)-remote-[^/]+)/
          );

          if (remoteImportMatch) {
            const importedPackage = remoteImportMatch[1];

            if (importedPackage !== currentPackage) {
              context.report({
                node,
                messageId: 'noDirectMfeImport',
                data: {
                  importPath,
                },
              });
            }
          }
        }
      },
    };
  },
};
