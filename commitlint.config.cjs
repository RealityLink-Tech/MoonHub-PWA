/**
 * Commitlint configuration for Clean Commit format
 * Format: <emoji> <type>[!][(<scope>)]: <description>
 *
 * Note: This config is permissive to avoid blocking commits.
 * Full emoji format validation is done in CI workflow (.github/workflows/ci.yml).
 */

module.exports = {
  rules: {
    // Basic header length
    'header-max-length': [2, 'always', 120],

    // Minimum message length
    'header-min-length': [2, 'always', 15],

    // All other rules disabled - rely on CI for strict validation
    'body-empty': [0],
    'body-leading-blank': [0],
    'footer-empty': [0],
    'footer-leading-blank': [0],
    'references-empty': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'scope-enum': [0],
    'scope-max-length': [0],
    'scope-min-length': [0],
    'signed-off-by': [0],
    'subject-case': [0],
    'subject-empty': [0],
    'subject-full-stop': [0],
    'subject-min-length': [0],
    'subject-exclamation-mark': [0],
    'trailer-exists': [0],
    'type-case': [0],
    'type-empty': [0],
    'type-enum': [0],
    'type-max-length': [0],
    'type-min-length': [0],
  },
};
