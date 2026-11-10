/**
 * projects.js - Projects Gallery Renderer & Category Filter
 */

import { projectsData } from "./data/projects-data.js";

document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("projects-grid");
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (!gridContainer) return;

  // Initial render: only public projects
  renderProjects("all");

  // Filter click handlers
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-category");
      renderProjects(category);
    });
  });

  function renderProjects(category) {
    gridContainer.innerHTML = "";

    // Filter to visible projects only
    const visibleProjects = projectsData.filter((p) => p.public);

    const filtered = category === "all"
      ? visibleProjects
      : visibleProjects.filter((p) => p.category === category);

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: var(--space-8);">
          <p style="color: var(--color-text-muted);">No projects currently published under this category.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((project) => {
      const card = createProjectCard(project);
      gridContainer.appendChild(card);
    });
  }

  function createProjectCard(project) {
    const article = document.createElement("article");
    article.className = "card";
    article.style.display = "flex";
    article.style.flexDirection = "column";
    article.style.justifyContent = "space-between";

    // Tech tags
    const techTagsHtml = project.technologies
      .map((tech) => `<span class="tech-tag">${escapeHtml(tech)}</span>`)
      .join("");

    // Links (render only if URL is present and verified)
    let linksHtml = "";
    if (project.repoUrl) {
      linksHtml += `
        <a href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          Repository
        </a>
      `;
    }
    if (project.demoUrl) {
      linksHtml += `
        <a href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Live Demo
        </a>
      `;
    }

    article.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-2); margin-bottom: var(--space-3);">
          <span class="badge badge-accent">${escapeHtml(project.statusLabel)}</span>
          <span class="badge" style="font-size: 0.7rem;">${escapeHtml(project.categoryLabel)}</span>
        </div>
        <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--space-2);">${escapeHtml(project.title)}</h3>
        <p style="font-size: var(--font-size-sm); margin-bottom: var(--space-4); line-height: 1.5;">${escapeHtml(project.summary)}</p>
      </div>

      <div>
        <div class="tag-list" style="margin-bottom: ${linksHtml ? 'var(--space-4)' : '0'};">
          ${techTagsHtml}
        </div>
        ${linksHtml ? `<div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">${linksHtml}</div>` : ""}
      </div>
    `;

    return article;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
