import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./coinfig/database.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();

const app = express();
const PORT = 5000;

// ==========================================
// Middleware
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// Root
// ==========================================

app.get("/", (_req, res) => {
  res.json({
    message: "mGit API is running 🚀",
  });
});

// ==========================================
// Health Check
// ==========================================

app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      service: "mGit",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      status: "error",
      service: "mGit",
      database: "disconnected",
    });
  }
});

// ==========================================
// Get Single Project
// ==========================================

app.get("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get project error:", error);

    res.status(500).json({
      message: "Failed to retrieve project",
    });
  }
});

// ==========================================
// Get Documentation Pages
// ==========================================

app.get(
  "/api/projects/:projectId/pages",
  async (req, res) => {
    try {
      const { projectId } = req.params;

      const result = await pool.query(
        `
        SELECT *
        FROM documentation_pages
        WHERE project_id = $1
        ORDER BY position ASC, created_at ASC
        `,
        [projectId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Get pages error:", error);

      res.status(500).json({
        message:
          "Failed to retrieve documentation pages",
      });
    }
  }
);

// ==========================================
// Create Documentation Page
// ==========================================

app.post(
  "/api/projects/:projectId/pages",
  async (req, res) => {
    try {
      const { projectId } = req.params;

      const {
        title,
        slug,
        content = "",
      } = req.body;

      if (!title || !slug) {
        return res.status(400).json({
          message:
            "Title and slug are required",
        });
      }

      // Find the next position for this project
      const positionResult = await pool.query(
        `
        SELECT COALESCE(MAX(position), -1) + 1
        AS next_position
        FROM documentation_pages
        WHERE project_id = $1
        `,
        [projectId]
      );

      const nextPosition =
        positionResult.rows[0].next_position;

      const result = await pool.query(
        `
        INSERT INTO documentation_pages
          (
            project_id,
            title,
            slug,
            content,
            position
          )
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          projectId,
          title.trim(),
          slug,
          content,
          nextPosition,
        ]
      );

      res.status(201).json(
        result.rows[0]
      );
    } catch (error) {
      console.error(
        "Create page error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create documentation page",
      });
    }
  }
);

// ==========================================
// Update Documentation Page
// ==========================================

app.put(
  "/api/pages/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        content,
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          message: "Title is required",
        });
      }

      const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const result = await pool.query(
        `
        UPDATE documentation_pages
        SET
          title = $1,
          slug = $2,
          content = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
        `,
        [
          title.trim(),
          slug,
          content || "",
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message:
            "Documentation page not found",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error(
        "Update page error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update documentation page",
      });
    }
  }
);

// ==========================================
// Delete Documentation Page
// ==========================================

app.delete(
  "/api/pages/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        DELETE FROM documentation_pages
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message:
            "Documentation page not found",
        });
      }

      res.json({
        message:
          "Documentation page deleted successfully",
        page: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Delete page error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete documentation page",
      });
    }
  }
);

// ==========================================
// Move Documentation Page UP
// ==========================================

app.put(
  "/api/pages/:id/move-up",
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { id } = req.params;

      await client.query("BEGIN");

      // Get current page
      const currentResult = await client.query(
        `
        SELECT *
        FROM documentation_pages
        WHERE id = $1
        `,
        [id]
      );

      if (currentResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message:
            "Documentation page not found",
        });
      }

      const currentPage =
        currentResult.rows[0];

      // Find the page immediately above
      const previousResult = await client.query(
        `
        SELECT *
        FROM documentation_pages
        WHERE project_id = $1
          AND position < $2
        ORDER BY position DESC
        LIMIT 1
        `,
        [
          currentPage.project_id,
          currentPage.position,
        ]
      );

      // Already at the top
      if (previousResult.rows.length === 0) {
        await client.query("COMMIT");

        return res.json(currentPage);
      }

      const previousPage =
        previousResult.rows[0];

      // Swap positions
      await client.query(
        `
        UPDATE documentation_pages
        SET
          position = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [
          previousPage.position,
          currentPage.id,
        ]
      );

      await client.query(
        `
        UPDATE documentation_pages
        SET
          position = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [
          currentPage.position,
          previousPage.id,
        ]
      );

      await client.query("COMMIT");

      // Return updated page list
      const result = await pool.query(
        `
        SELECT *
        FROM documentation_pages
        WHERE project_id = $1
        ORDER BY position ASC, created_at ASC
        `,
        [currentPage.project_id]
      );

      res.json(result.rows);
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "Move page up error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to move documentation page",
      });
    } finally {
      client.release();
    }
  }
);

// ==========================================
// Move Documentation Page DOWN
// ==========================================

app.put(
  "/api/pages/:id/move-down",
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { id } = req.params;

      await client.query("BEGIN");

      // Get current page
      const currentResult = await client.query(
        `
        SELECT *
        FROM documentation_pages
        WHERE id = $1
        `,
        [id]
      );

      if (currentResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message:
            "Documentation page not found",
        });
      }

      const currentPage =
        currentResult.rows[0];

      // Find the page immediately below
      const nextResult = await client.query(
        `
        SELECT *
        FROM documentation_pages
        WHERE project_id = $1
          AND position > $2
        ORDER BY position ASC
        LIMIT 1
        `,
        [
          currentPage.project_id,
          currentPage.position,
        ]
      );

      // Already at the bottom
      if (nextResult.rows.length === 0) {
        await client.query("COMMIT");

        return res.json(currentPage);
      }

      const nextPage =
        nextResult.rows[0];

      // Swap positions
      await client.query(
        `
        UPDATE documentation_pages
        SET
          position = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [
          nextPage.position,
          currentPage.id,
        ]
      );

      await client.query(
        `
        UPDATE documentation_pages
        SET
          position = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [
          currentPage.position,
          nextPage.id,
        ]
      );

      await client.query("COMMIT");

      // Return updated page list
      const result = await pool.query(
        `
        SELECT *
        FROM documentation_pages
        WHERE project_id = $1
        ORDER BY position ASC, created_at ASC
        `,
        [currentPage.project_id]
      );

      res.json(result.rows);
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "Move page down error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to move documentation page",
      });
    } finally {
      client.release();
    }
  }
);

// ==========================================
// Project Routes
// ==========================================

app.use(
  "/api/projects",
  projectRoutes
);

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
  console.log(
    `mGit API running on http://localhost:${PORT}`
  );
});