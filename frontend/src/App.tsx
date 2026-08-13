import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import WebDocs from "./pages/WebDocs";
import Footer from "./Components/footer";

import "./index.css";

type Page = "projects" | "about" | "web-docs";

function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("projects");

  const navigateTo = (page: Page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="app">

      {/* ======================================
          MAIN PAGE
          ====================================== */}

      {currentPage === "projects" && (
        <Dashboard />
      )}

      {currentPage === "about" && (
        <About
          currentPage={currentPage}
          onNavigate={navigateTo}
        />
      )}

      {currentPage === "web-docs" && (
        <WebDocs onNavigate={navigateTo} />
      )}

      {/* ======================================
          GLOBAL FOOTER
          ====================================== */}

      <Footer
        currentPage={currentPage}
        onNavigate={navigateTo}
      />

    </div>
  );
}

export default App;