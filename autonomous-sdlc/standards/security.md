# Security Standards

- Do not store secrets, access tokens, or private endpoints in HTML, JavaScript, Markdown, or exported documents.
- Avoid adding third-party scripts unless there is a clear product need and the source is documented in `plan.md`.
- Keep external dependencies minimal. The current prototypes only rely on hosted fonts.
- Treat any future form submission, authentication, payment, or file upload work as high-risk and require an explicit approval gate.
- If a feature introduces user data, document retention, trust boundaries, and failure cases before implementation.
