import type { Request, Response } from "express";
import pool from "../coinfig/database.js";

export const createProject = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Project name is required",
      });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const result = await pool.query(
      `
      INSERT INTO projects (name, description, slug)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [name.trim(), description || null, slug]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      error: "Failed to create project",
    });
  }
};

export const getProjects = async (
  _req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM projects
      ORDER BY created_at DESC
      `
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      error: "Failed to fetch projects",
    });
  }
};

export const getProject = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM projects
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      error: "Failed to fetch project",
    });
  }
};