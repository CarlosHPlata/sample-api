// Commit messages and PR titles follow Conventional Commits and end with a ticket:
//
//   feat: add stock levels to products (INV-42)
//   fix(products)!: reject negative prices (INV-57)
//
// One set of rules for both places they are checked: the commit-msg git hook
// (.husky/commit-msg) and the PR check (.github/workflows/conventional-commits.yml).

/** A Jira-style key in parentheses at the end of the subject: " (ABC-123)". */
const TICKET = /\s\([A-Z][A-Z0-9]+-\d+\)$/;

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        // An empty subject is already reported by subject-empty.
        'subject-ticket': ({ subject }) => [
          !subject || TICKET.test(subject),
          'subject must end with a ticket in parentheses, e.g. "feat: add stock levels (INV-42)"',
        ],
      },
    },
  ],
  rules: {
    'subject-ticket': [2, 'always'],
  },
};
