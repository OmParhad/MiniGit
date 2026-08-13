import { useEffect, useState } from "react";
import ProjectWorkspace from "./ProjectWorkspace";

type Project = {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
};

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedProjectId, setSelectedProjectId] =
  useState<number | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/projects"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();

      setProjects(data);
    } catch (error) {
      console.error("Projects error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async () => {
    if (!projectName.trim() || creating) {
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: projectName,
            description: projectDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const newProject = await response.json();

      setProjects((prev) => [newProject, ...prev]);

      setProjectName("");
      setProjectDescription("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Create project error:", error);
      alert("Failed to create project.");
    } finally {
      setCreating(false);
    }
  };


if (selectedProjectId !== null) {
  return (
    <ProjectWorkspace
      projectId={selectedProjectId}
      onBack={() => setSelectedProjectId(null)}
    />
  );
}
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>MiniGit</h1>
          <p>Your projects</p>
        </div>

        <button
          className="create-project-button"
          onClick={() => setShowCreateForm(true)}
        >
          + New Project
        </button>
      </header>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>

          <p>
            Create your first project to start building
            documentation.
          </p>

        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <article
              className="project-card"
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <h2>{project.name}</h2>

              <p>
                {project.description ||
                  "No description provided."}
              </p>

              <span>/{project.slug}</span>
            </article>
          ))}
        </div>
      )}

      {showCreateForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateForm(false)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Create a new project</h2>

              <button
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="project-name">
                Project name
              </label>

              <input
                id="project-name"
                type="text"
                placeholder="My Awesome Project"
                value={projectName}
                onChange={(event) =>
                  setProjectName(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-description">
                Description
              </label>

              <textarea
                id="project-description"
                placeholder="What is this project about?"
                value={projectDescription}
                onChange={(event) =>
                  setProjectDescription(event.target.value)
                }
                rows={4}
              />
            </div>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>

              <button
                className="create-project-button"
                onClick={createProject}
                disabled={
                  !projectName.trim() || creating
                }
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;