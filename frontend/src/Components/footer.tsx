type Page =
  | "projects"
  | "about"
  | "web-docs";

type FooterProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

function Footer({
  currentPage,
  onNavigate,
}: FooterProps) {
  return (
    <footer className="site-footer">

      <div className="site-footer-inner">

        {/* ==================================
            BRAND
            ================================== */}

        <div className="footer-brand">

          <button
            type="button"
            className="footer-logo"
            onClick={() =>
              onNavigate("projects")
            }
            aria-label="Go to projects"
          >
            mGit
          </button>

          <p className="footer-tagline">
            A local-first workspace for
            building and documenting projects.
          </p>

        </div>

        {/* ==================================
            PROJECT
            ================================== */}

        <div className="footer-column">

          <h3>
            PROJECT
          </h3>

          <button
            type="button"
            className={
              currentPage === "projects"
                ? "footer-link active"
                : "footer-link"
            }
            onClick={() =>
              onNavigate("projects")
            }
          >
            Projects
          </button>

          <button
            type="button"
            className={
              currentPage === "about"
                ? "footer-link active"
                : "footer-link"
            }
            onClick={() =>
              onNavigate("about")
            }
          >
            About
          </button>

        </div>

        {/* ==================================
            RESOURCES
            ================================== */}

        <div className="footer-column">

          <h3>
            RESOURCES
          </h3>

          <button
            type="button"
            className={
              currentPage === "web-docs"
                ? "footer-link active"
                : "footer-link"
            }
            onClick={() =>
              onNavigate("web-docs")
            }
          >
            Web Docs
          </button>

          <button
            type="button"
            className="footer-link"
            onClick={() =>
              onNavigate("projects")
            }
          >
            Documentation
          </button>

        </div>

        {/* ==================================
            LEARN
            ================================== */}

        <div className="footer-column">

          <h3>
            mGit
          </h3>

          <button
            type="button"
            className="footer-link"
            onClick={() =>
              onNavigate("about")
            }
          >
            What is mGit?
          </button>

          <button
            type="button"
            className="footer-link"
            onClick={() =>
              onNavigate("web-docs")
            }
          >
            How it works
          </button>

        </div>

      </div>

      {/* ======================================
          FOOTER BOTTOM
          ====================================== */}

      <div className="site-footer-bottom">

        <span>
          © 2026 mGit
        </span>

        <span>
          Built for developers.
        </span>

      </div>

    </footer>
  );
}

export default Footer;