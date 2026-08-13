import { useEffect, useRef, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

type Project = {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
};

type DocumentationPage = {
  id: number;
  project_id: number;
  title: string;
  slug: string;
  content: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type ProjectWorkspaceProps = {
  projectId: number;
  onBack: () => void;
};

function ProjectWorkspace({
  projectId,
  onBack,
}: ProjectWorkspaceProps) {
  const [project, setProject] =
    useState<Project | null>(null);

  const [pages, setPages] =
    useState<DocumentationPage[]>([]);

  const [selectedPage, setSelectedPage] =
    useState<DocumentationPage | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // New Page
  // ==========================================

  const [showNewPage, setShowNewPage] =
    useState(false);

  const [pageTitle, setPageTitle] =
    useState("");

  const [pageContent, setPageContent] =
    useState("");

  const [creatingPage, setCreatingPage] =
    useState(false);

  // ==========================================
  // Edit Page
  // ==========================================

  const [editingPage, setEditingPage] =
    useState(false);

  const [editTitle, setEditTitle] =
    useState("");

  const [editContent, setEditContent] =
    useState("");

  const [savingPage, setSavingPage] =
    useState(false);

  const [editorPreview, setEditorPreview] =
    useState(false);

  const editorRef =
    useRef<HTMLTextAreaElement | null>(null);

  // ==========================================
  // Delete Page
  // ==========================================

  const [deletingPage, setDeletingPage] =
    useState(false);

  // ==========================================
  // Fetch Workspace
  // ==========================================

  const fetchWorkspace = async () => {
    try {
      const [
        projectResponse,
        pagesResponse,
      ] = await Promise.all([
        fetch(
          `http://localhost:5000/api/projects/${projectId}`
        ),

        fetch(
          `http://localhost:5000/api/projects/${projectId}/pages`
        ),
      ]);

      if (!projectResponse.ok) {
        throw new Error(
          "Failed to fetch project"
        );
      }

      if (!pagesResponse.ok) {
        throw new Error(
          "Failed to fetch pages"
        );
      }

      const projectData =
        await projectResponse.json();

      const pagesData =
        await pagesResponse.json();

      setProject(projectData);
      setPages(pagesData);

      if (pagesData.length > 0) {
        setSelectedPage(pagesData[0]);
      } else {
        setSelectedPage(null);
      }
    } catch (error) {
      console.error(
        "Workspace error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [projectId]);

  // ==========================================
  // Select Page
  // ==========================================

  const selectPage = (
    page: DocumentationPage
  ) => {
    setSelectedPage(page);

    setEditingPage(false);
    setEditorPreview(false);

    setEditTitle("");
    setEditContent("");
  };

  // ==========================================
  // Previous / Next Page Navigation
  // ==========================================

  const goToPage = (
    direction: "previous" | "next"
  ) => {
    if (
      !selectedPage ||
      pages.length === 0
    ) {
      return;
    }

    const currentIndex =
      pages.findIndex(
        (page) =>
          page.id === selectedPage.id
      );

    if (currentIndex === -1) {
      return;
    }

    const newIndex =
      direction === "previous"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      newIndex < 0 ||
      newIndex >= pages.length
    ) {
      return;
    }

    selectPage(pages[newIndex]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // Create Documentation Page
  // ==========================================

  const createPage = async () => {
    if (
      !pageTitle.trim() ||
      creatingPage
    ) {
      return;
    }

    setCreatingPage(true);

    const slug = pageTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/pages`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: pageTitle.trim(),
            slug,
            content: pageContent,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        throw new Error(
          errorData.message ||
            "Failed to create page"
        );
      }

      const newPage =
        await response.json();

      setPages((prev) => [
        ...prev,
        newPage,
      ]);

      setSelectedPage(newPage);

      setPageTitle("");
      setPageContent("");

      setShowNewPage(false);
    } catch (error) {
      console.error(
        "Create page error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create page."
      );
    } finally {
      setCreatingPage(false);
    }
  };

  // ==========================================
  // Start Editing
  // ==========================================

  const startEditing = () => {
    if (!selectedPage) {
      return;
    }

    setEditTitle(
      selectedPage.title
    );

    setEditContent(
      selectedPage.content
    );

    setEditorPreview(false);
    setEditingPage(true);
  };

  // ==========================================
  // Cancel Editing
  // ==========================================

  const cancelEditing = () => {
    setEditingPage(false);
    setEditorPreview(false);

    setEditTitle("");
    setEditContent("");
  };

  // ==========================================
  // Insert Markdown
  // ==========================================

  const insertMarkdown = (
    before: string,
    after = "",
    placeholder = "text"
  ) => {
    const textarea =
      editorRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selectedText =
      editContent.substring(
        start,
        end
      );

    const text =
      selectedText || placeholder;

    const replacement =
      before + text + after;

    const newContent =
      editContent.substring(
        0,
        start
      ) +
      replacement +
      editContent.substring(end);

    setEditContent(newContent);

    requestAnimationFrame(() => {
      textarea.focus();

      const selectionStart =
        start + before.length;

      const selectionEnd =
        selectionStart + text.length;

      textarea.setSelectionRange(
        selectionStart,
        selectionEnd
      );
    });
  };

  // ==========================================
  // Insert Line Prefix
  // ==========================================

  const insertLinePrefix = (
    prefix: string
  ) => {
    const textarea =
      editorRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selectedText =
      editContent.substring(
        start,
        end
      );

    const text =
      selectedText || "List item";

    const lines =
      text.split("\n");

    const replacement =
      lines
        .map(
          (line) =>
            prefix + line
        )
        .join("\n");

    const newContent =
      editContent.substring(
        0,
        start
      ) +
      replacement +
      editContent.substring(end);

    setEditContent(newContent);

    requestAnimationFrame(() => {
      textarea.focus();

      textarea.setSelectionRange(
        start,
        start + replacement.length
      );
    });
  };

  // ==========================================
  // Insert Code Block
  // ==========================================

  const insertCodeBlock = () => {
    const textarea =
      editorRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selectedText =
      editContent.substring(
        start,
        end
      );

    const code =
      selectedText ||
      'console.log("Hello mGit!");';

    const replacement =
      `\`\`\`javascript\n${code}\n\`\`\``;

    const newContent =
      editContent.substring(
        0,
        start
      ) +
      replacement +
      editContent.substring(end);

    setEditContent(newContent);

    requestAnimationFrame(() => {
      textarea.focus();

      textarea.setSelectionRange(
        start,
        start + replacement.length
      );
    });
  };

  // ==========================================
  // Insert LaTeX Inline
  // ==========================================

  const insertInlineLatex = () => {
    insertMarkdown(
      "$",
      "$",
      "E = mc^2"
    );
  };

  // ==========================================
  // Insert LaTeX Block
  // ==========================================

  const insertBlockLatex = () => {
    const textarea =
      editorRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selectedText =
      editContent.substring(
        start,
        end
      );

    const formula =
      selectedText ||
      "\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}";

    const replacement =
      `\n$$\n${formula}\n$$\n`;

    const newContent =
      editContent.substring(
        0,
        start
      ) +
      replacement +
      editContent.substring(end);

    setEditContent(newContent);

    requestAnimationFrame(() => {
      textarea.focus();

      textarea.setSelectionRange(
        start,
        start + replacement.length
      );
    });
  };

  // ==========================================
  // Insert Image
  // ==========================================

  const insertImage = () => {
    insertMarkdown(
      "![",
      "](https://example.com/image.png)",
      "Image description"
    );
  };

  // ==========================================
  // Insert Table
  // ==========================================

  const insertTable = () => {
    const textarea =
      editorRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const table = `
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |
`;

    const newContent =
      editContent.substring(
        0,
        start
      ) +
      table +
      editContent.substring(end);

    setEditContent(newContent);

    requestAnimationFrame(() => {
      textarea.focus();

      textarea.setSelectionRange(
        start,
        start + table.length
      );
    });
  };

  // ==========================================
  // Keyboard Shortcuts
  // ==========================================

  const handleEditorKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() === "b"
    ) {
      event.preventDefault();

      insertMarkdown(
        "**",
        "**",
        "bold text"
      );

      return;
    }

    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() === "i"
    ) {
      event.preventDefault();

      insertMarkdown(
        "*",
        "*",
        "italic text"
      );

      return;
    }

    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {
      event.preventDefault();

      insertMarkdown(
        "[",
        "](https://example.com)",
        "link text"
      );

      return;
    }
  };

  // ==========================================
  // Save Page
  // ==========================================

  const savePage = async () => {
    if (
      !selectedPage ||
      !editTitle.trim() ||
      savingPage ||
      deletingPage
    ) {
      return;
    }

    setSavingPage(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/pages/${selectedPage.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: editTitle.trim(),
            content: editContent,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        throw new Error(
          errorData.message ||
            "Failed to save page"
        );
      }

      const updatedPage =
        await response.json();

      setPages((prev) =>
        prev.map((page) =>
          page.id === updatedPage.id
            ? updatedPage
            : page
        )
      );

      setSelectedPage(updatedPage);

      setEditingPage(false);
      setEditorPreview(false);

      setEditTitle("");
      setEditContent("");
    } catch (error) {
      console.error(
        "Save page error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save page."
      );
    } finally {
      setSavingPage(false);
    }
  };

  // ==========================================
  // Delete Page
  // ==========================================

  const deletePage = async () => {
    if (
      !selectedPage ||
      deletingPage ||
      savingPage
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${selectedPage.title}"?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingPage(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/pages/${selectedPage.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        throw new Error(
          errorData.message ||
            "Failed to delete page"
        );
      }

      const remainingPages =
        pages.filter(
          (page) =>
            page.id !== selectedPage.id
        );

      setPages(remainingPages);

      if (remainingPages.length > 0) {
        setSelectedPage(
          remainingPages[0]
        );
      } else {
        setSelectedPage(null);
      }

      setEditingPage(false);
      setEditorPreview(false);

      setEditTitle("");
      setEditContent("");
    } catch (error) {
      console.error(
        "Delete page error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete page."
      );
    } finally {
      setDeletingPage(false);
    }
  };

  // ==========================================
  // Markdown Renderer
  // ==========================================

  const renderMarkdown = (
    content: string
  ) => {
    return (
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
        ]}
        rehypePlugins={[
          rehypeHighlight,
          rehypeKatex,
        ]}
        components={{
          // ----------------------------------
          // Links
          // ----------------------------------

          a: ({
            node,
            ...props
          }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),

          // ----------------------------------
          // Images
          // ----------------------------------

          img: ({
            node,
            ...props
          }) => (
            <img
              {...props}
              loading="lazy"
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
                margin: "1.5rem auto",
                borderRadius: "8px",
              }}
            />
          ),

          // ----------------------------------
          // Code Blocks
          // ----------------------------------

          code: ({
            node,
            className,
            children,
            ...props
          }) => {
            const match =
              /language-(\w+)/.exec(
                className || ""
              );

            const isInline =
              !className &&
              !String(children).includes(
                "\n"
              );

            if (isInline) {
              return (
                <code
                  {...props}
                  className="inline-code"
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="code-block-wrapper">
                {match && (
                  <div className="code-language">
                    {match[1]}
                  </div>
                )}

                <code
                  {...props}
                  className={className}
                >
                  {children}
                </code>
              </div>
            );
          },

          // ----------------------------------
          // Table
          // ----------------------------------

          table: ({
            node,
            ...props
          }) => (
            <div className="markdown-table-wrapper">
              <table
                {...props}
                className="markdown-table"
              />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="workspace-loading">
        Loading project...
      </div>
    );
  }

  // ==========================================
  // Project Not Found
  // ==========================================

  if (!project) {
    return (
      <div className="workspace-error">
        <h2>Project not found</h2>

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to projects
        </button>
      </div>
    );
  }

  // ==========================================
  // Workspace
  // ==========================================

  return (
    <div className="workspace">

      {/* ======================================
          HEADER
          ====================================== */}

      <header className="workspace-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← mGit
        </button>

        <div className="workspace-project-name">
          {project.name}
        </div>

      </header>

      {/* ======================================
          WORKSPACE BODY
          ====================================== */}

      <div className="workspace-body">

        {/* ====================================
            SIDEBAR
            ==================================== */}

        <aside className="workspace-sidebar">

          <div className="sidebar-header">

            <div className="sidebar-title">
              Documentation
            </div>

            <button
              className="new-page-button"
              onClick={() =>
                setShowNewPage(true)
              }
              title="Create page"
              aria-label="Create page"
            >
              +
            </button>

          </div>

          {pages.length === 0 ? (

            <p className="sidebar-empty">
              No pages yet.
            </p>

          ) : (

            pages.map((page) => (

              <button
                key={page.id}
                className={`sidebar-item ${
                  selectedPage?.id === page.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectPage(page)
                }
              >
                {page.title}
              </button>

            ))

          )}

        </aside>

        {/* ====================================
            MAIN CONTENT
            ==================================== */}

        <main className="workspace-content">

          {selectedPage ? (

            editingPage ? (

              /* =================================
                 EDIT MODE
                 ================================= */

              <div className="page-editor">

                {/* EDITOR HEADER */}

                <div className="editor-header">

                  <div className="editor-heading">

                    <span className="editor-eyebrow">
                      DOCUMENTATION
                    </span>

                    <h1>
                      Edit Page
                    </h1>

                  </div>

                  <button
                    type="button"
                    className={`preview-toggle ${
                      editorPreview
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setEditorPreview(
                        !editorPreview
                      )
                    }
                  >
                    <span className="preview-icon">
                      {editorPreview
                        ? "✎"
                        : "◉"}
                    </span>

                    {editorPreview
                      ? "Edit"
                      : "Preview"}
                  </button>

                </div>

                {/* PAGE TITLE */}

                <div className="form-group editor-title-group">

                  <label htmlFor="edit-page-title">
                    PAGE TITLE
                  </label>

                  <input
                    id="edit-page-title"
                    type="text"
                    value={editTitle}
                    onChange={(event) =>
                      setEditTitle(
                        event.target.value
                      )
                    }
                    className="editor-title-input"
                    placeholder="Page title"
                  />

                </div>

                {!editorPreview ? (

                  /* =================================
                     MARKDOWN EDITOR
                     ================================= */

                  <div className="editor-container">

                    {/* TOOLBAR */}

                    <div className="editor-toolbar">

                      {/* TEXT FORMAT */}

                      <div className="toolbar-group">

                        <button
                          type="button"
                          className="toolbar-button toolbar-format"
                          title="Bold (Ctrl+B)"
                          onClick={() =>
                            insertMarkdown(
                              "**",
                              "**",
                              "bold text"
                            )
                          }
                        >
                          <strong>B</strong>
                        </button>

                        <button
                          type="button"
                          className="toolbar-button toolbar-format"
                          title="Italic (Ctrl+I)"
                          onClick={() =>
                            insertMarkdown(
                              "*",
                              "*",
                              "italic text"
                            )
                          }
                        >
                          <em>I</em>
                        </button>

                      </div>

                      <span className="toolbar-divider" />

                      {/* HEADINGS */}

                      <div className="toolbar-group">

                        <button
                          type="button"
                          className="toolbar-button"
                          title="Heading 1"
                          onClick={() =>
                            insertLinePrefix(
                              "# "
                            )
                          }
                        >
                          H1
                        </button>

                        <button
                          type="button"
                          className="toolbar-button"
                          title="Heading 2"
                          onClick={() =>
                            insertLinePrefix(
                              "## "
                            )
                          }
                        >
                          H2
                        </button>

                        <button
                          type="button"
                          className="toolbar-button"
                          title="Heading 3"
                          onClick={() =>
                            insertLinePrefix(
                              "### "
                            )
                          }
                        >
                          H3
                        </button>

                      </div>

                      <span className="toolbar-divider" />

                      {/* LISTS */}

                      <div className="toolbar-group">

                        <button
                          type="button"
                          className="toolbar-button toolbar-wide"
                          title="Bullet list"
                          onClick={() =>
                            insertLinePrefix(
                              "- "
                            )
                          }
                        >
                          • List
                        </button>

                        <button
                          type="button"
                          className="toolbar-button toolbar-wide"
                          title="Numbered list"
                          onClick={() =>
                            insertLinePrefix(
                              "1. "
                            )
                          }
                        >
                          1. List
                        </button>

                        <button
                          type="button"
                          className="toolbar-button toolbar-wide"
                          title="Quote"
                          onClick={() =>
                            insertLinePrefix(
                              "> "
                            )
                          }
                        >
                          “ Quote
                        </button>

                      </div>

                      <span className="toolbar-divider" />

                      {/* CODE */}

                      <div className="toolbar-group">

                        <button
                          type="button"
                          className="toolbar-button"
                          title="Inline code"
                          onClick={() =>
                            insertMarkdown(
                              "`",
                              "`",
                              "code"
                            )
                          }
                        >
                          {"</>"}
                        </button>

                        <button
                          type="button"
                          className="toolbar-button toolbar-wide"
                          title="Code block"
                          onClick={
                            insertCodeBlock
                          }
                        >
                          {"{ }"} Code
                        </button>

                      </div>

                      <span className="toolbar-divider" />

                      {/* LINKS / IMAGES */}

                      <div className="toolbar-group">

                        <button
                          type="button"
                          className="toolbar-button"
                          title="Link (Ctrl+K)"
                          onClick={() =>
                            insertMarkdown(
                              "[",
                              "](https://example.com)",
                              "link text"
                            )
                          }
                        >
                          🔗
                        </button>

                        <button
                          type="button"
                          className="toolbar-button"
                          title="Image"
                          onClick={
                            insertImage
                          }
                        >
                          🖼
                        </button>

                      </div>

                      <span className="toolbar-divider" />

                      {/* LATEX */}

                      <div className="toolbar-group">

                        <button
                          type="button"
                          className="toolbar-button toolbar-latex"
                          title="Inline LaTeX"
                          onClick={
                            insertInlineLatex
                          }
                        >
                          x²
                        </button>

                        <button
                          type="button"
                          className="toolbar-button toolbar-latex"
                          title="Block LaTeX"
                          onClick={
                            insertBlockLatex
                          }
                        >
                          ∑
                        </button>

                      </div>

                      <span className="toolbar-divider" />

                      {/* TABLE */}

                      <div className="toolbar-group">

                        <button
                          type="button"
                          className="toolbar-button"
                          title="Insert table"
                          onClick={
                            insertTable
                          }
                        >
                          ▦
                        </button>

                      </div>

                      <span className="toolbar-divider" />

                      {/* HORIZONTAL RULE */}

                      <div className="toolbar-group">

                        <button
                          type="button"
                          className="toolbar-button"
                          title="Horizontal rule"
                          onClick={() =>
                            insertMarkdown(
                              "\n---\n",
                              "",
                              ""
                            )
                          }
                        >
                          —
                        </button>

                      </div>

                    </div>

                    {/* MARKDOWN TEXTAREA */}

                    <textarea
                      ref={editorRef}
                      id="edit-page-content"
                      value={editContent}
                      onChange={(event) =>
                        setEditContent(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleEditorKeyDown
                      }
                      className="markdown-editor"
                      spellCheck={false}
                      placeholder={`# Getting Started

Write your documentation using Markdown.

## Mathematics

Inline equation:

$E = mc^2$

Block equation:

$$
\\int_0^1 x^2 dx
$$

## Code

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

## Image

![Architecture](https://example.com/image.png)

## Table

| Name | Language |
|------|----------|
| React | TypeScript |
| Express | TypeScript |
`}
                    />

                    {/* EDITOR FOOTER */}

                    <div className="editor-footer">

                      <span className="editor-language">
                        <span className="status-dot" />
                        Markdown + LaTeX
                      </span>

                      <span className="editor-stats">
                        {editContent.length}{" "}
                        characters
                        {" · "}
                        {
                          editContent
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean)
                            .length
                        }{" "}
                        words
                      </span>

                    </div>

                  </div>

                ) : (

                  /* =================================
                     PREVIEW
                     ================================= */

                  <div className="editor-preview">

                    <div className="preview-label">
                      <span className="preview-label-dot" />
                      Preview
                    </div>

                    <div className="documentation-content">

                      {editContent ? (

                        renderMarkdown(
                          editContent
                        )

                      ) : (

                        <p>
                          Nothing to preview yet.
                        </p>

                      )}

                    </div>

                  </div>

                )}

                {/* EDITOR ACTIONS */}

                <div className="editor-actions">

                  <button
                    type="button"
                    className="cancel-button editor-cancel-button"
                    onClick={
                      cancelEditing
                    }
                    disabled={
                      savingPage ||
                      deletingPage
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="create-project-button editor-save-button"
                    onClick={savePage}
                    disabled={
                      !editTitle.trim() ||
                      savingPage ||
                      deletingPage
                    }
                  >
                    {savingPage
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </div>

            ) : (

              /* =================================
                 READ MODE
                 ================================= */

              <div className="documentation-page">

                <div className="page-header">

                  <h1>
                    {selectedPage.title}
                  </h1>

                  <div className="page-actions">

                    <button
                      className="edit-page-button"
                      onClick={
                        startEditing
                      }
                      disabled={
                        deletingPage
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-page-button"
                      onClick={
                        deletePage
                      }
                      disabled={
                        deletingPage
                      }
                    >
                      {deletingPage
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

                {/* DOCUMENTATION CONTENT */}

                <div className="documentation-content">

                  {selectedPage.content ? (

                    renderMarkdown(
                      selectedPage.content
                    )

                  ) : (

                    <p>
                      This page is empty.
                    </p>

                  )}

                </div>

                {/* PREVIOUS / NEXT */}

                {pages.length > 1 && (
                  <div className="page-navigation">

                    <button
                      type="button"
                      className="page-nav-button page-nav-previous"
                      onClick={() =>
                        goToPage(
                          "previous"
                        )
                      }
                      disabled={
                        pages.findIndex(
                          (page) =>
                            page.id ===
                            selectedPage.id
                        ) === 0
                      }
                    >
                      <span className="page-nav-arrow">
                        ←
                      </span>

                      <span>
                        Previous
                      </span>
                    </button>

                    <div className="page-nav-position">
                      {pages.findIndex(
                        (page) =>
                          page.id ===
                          selectedPage.id
                      ) + 1}{" "}
                      / {pages.length}
                    </div>

                    <button
                      type="button"
                      className="page-nav-button page-nav-next"
                      onClick={() =>
                        goToPage(
                          "next"
                        )
                      }
                      disabled={
                        pages.findIndex(
                          (page) =>
                            page.id ===
                            selectedPage.id
                        ) ===
                        pages.length - 1
                      }
                    >
                      <span>
                        Next
                      </span>

                      <span className="page-nav-arrow">
                        →
                      </span>
                    </button>

                  </div>
                )}

              </div>

            )

          ) : (

            /* =================================
               PROJECT HOME
               ================================= */

            <div className="project-home">

              <h1>
                {project.name}
              </h1>

              <p className="project-description">
                {project.description ||
                  "No description provided."}
              </p>

              <hr />

              <h2>
                Documentation
              </h2>

              <p>
                Create your first documentation
                page to get started.
              </p>

            </div>

          )}

        </main>

      </div>

      {/* ======================================
          NEW PAGE MODAL
          ====================================== */}

      {showNewPage && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowNewPage(false)
          }
        >

          <div
            className="modal new-page-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <h2>
                Create documentation page
              </h2>

              <button
                className="modal-close"
                onClick={() =>
                  setShowNewPage(false)
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <div className="form-group">

              <label htmlFor="page-title">
                Page title
              </label>

              <input
                id="page-title"
                type="text"
                placeholder="Getting Started"
                value={pageTitle}
                onChange={(event) =>
                  setPageTitle(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label htmlFor="page-content">
                Content
              </label>

              <textarea
                id="page-content"
                placeholder={`# Getting Started

Write your documentation using Markdown.

## Mathematics

$E = mc^2$

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Code

\`\`\`javascript
console.log("Hello mGit!");
\`\`\`

## Table

| Feature | Supported |
|---------|-----------|
| Markdown | Yes |
| LaTeX | Yes |
| Images | Yes |
`}
                value={pageContent}
                onChange={(event) =>
                  setPageContent(
                    event.target.value
                  )
                }
                rows={12}
              />

            </div>

            <div className="modal-actions">

              <button
                className="cancel-button"
                onClick={() =>
                  setShowNewPage(false)
                }
              >
                Cancel
              </button>

              <button
                className="create-project-button"
                onClick={createPage}
                disabled={
                  !pageTitle.trim() ||
                  creatingPage
                }
              >
                {creatingPage
                  ? "Creating..."
                  : "Create Page"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ProjectWorkspace;