type WebDocsProps = {
  onNavigate: (
    page: "projects" | "about" | "web-docs"
  ) => void;
};

function WebDocs({
  onNavigate,
}: WebDocsProps) {
  return (
    <main className="static-page">

      <div className="static-page-inner">

        <span className="static-page-eyebrow">
          WEB DOCS
        </span>

        <h1>
          mGit Documentation
        </h1>

        <p className="static-page-lead">
          Learn how to use mGit to create
          projects and build technical
          documentation.
        </p>

        {/* ==================================
            GETTING STARTED
            ================================== */}

        <section className="static-section">

          <h2>
            Getting Started
          </h2>

          <p>
            Start by creating a project from
            the Projects dashboard.
          </p>

          <p>
            Each project can contain multiple
            documentation pages that can be
            organized from the project workspace.
          </p>

        </section>

        {/* ==================================
            DOCUMENTATION
            ================================== */}

        <section className="static-section">

          <h2>
            Documentation
          </h2>

          <p>
            Documentation pages use Markdown
            as their underlying format.
          </p>

          <ul>
            <li>
              Headings
            </li>

            <li>
              Bold and italic text
            </li>

            <li>
              Lists
            </li>

            <li>
              Links
            </li>

            <li>
              Tables
            </li>

            <li>
              Images
            </li>

            <li>
              Code blocks
            </li>

            <li>
              Syntax highlighting
            </li>

            <li>
              LaTeX mathematics
            </li>
          </ul>

        </section>

        {/* ==================================
            MARKDOWN
            ================================== */}

        <section className="static-section">

          <h2>
            Markdown
          </h2>

          <p>
            You can write normal Markdown
            directly inside the editor.
          </p>

          <pre className="docs-code-block">
{`# My Documentation

## Installation

npm install

**Important**

- Step one
- Step two`}
          </pre>

        </section>

        {/* ==================================
            LATEX
            ================================== */}

        <section className="static-section">

          <h2>
            LaTeX
          </h2>

          <p>
            Mathematical expressions can be
            written using LaTeX syntax.
          </p>

          <pre className="docs-code-block">
{`$$
E = mc^2
$$`}
          </pre>

          <p>
            LaTeX is particularly useful for
            mathematical, scientific, and
            engineering documentation.
          </p>

        </section>

        {/* ==================================
            CODE
            ================================== */}

        <section className="static-section">

          <h2>
            Code Blocks
          </h2>

          <p>
            Fenced Markdown code blocks can
            specify their programming language
            for syntax highlighting.
          </p>

          <pre className="docs-code-block">
{`\`\`\`javascript
const message = "Hello mGit!";

console.log(message);
\`\`\``}
          </pre>

        </section>

        {/* ==================================
            NAVIGATION
            ================================== */}

        <div className="static-page-actions">

          <button
            type="button"
            className="primary-page-button"
            onClick={() =>
              onNavigate("projects")
            }
          >
            Open Projects →
          </button>

          <button
            type="button"
            className="secondary-page-button"
            onClick={() =>
              onNavigate("about")
            }
          >
            About MiniGit
          </button>

        </div>

      </div>

    </main>
  );
}

export default WebDocs;