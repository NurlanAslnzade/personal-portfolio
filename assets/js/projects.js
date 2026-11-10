/**
 * projects.js - Projects Gallery Renderer
 *
 * Distinctly renders:
 * - Section A: Mandatory SITE 1101 Coursework (Primary Visual Prominence)
 * - Section B: Supplementary Personal & ML Projects (Secondary Showcase with Filters)
 */

import { projectsData } from "./data/projects-data.js";

document.addEventListener("DOMContentLoaded", () => {
  const courseworkContainer = document.getElementById("coursework-projects-grid");
  const supplementaryContainer = document.getElementById("supplementary-projects-grid");
  const filterButtons = document.querySelectorAll(".filter-bar .filter-btn");

  // Render Section A: Mandatory Coursework
  if (courseworkContainer) {
    renderCoursework(courseworkContainer);
  }

  // Render Section B: Supplementary Personal Projects
  if (supplementaryContainer) {
    renderSupplementary(supplementaryContainer, "all");

    // Filter button event listeners for supplementary projects
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const category = btn.getAttribute("data-category");
        renderSupplementary(supplementaryContainer, category);
      });
    });
  }
});

/**
 * Render Section A: Mandatory SITE 1101 Coursework Cards
 */
function renderCoursework(container) {
  container.innerHTML = "";

  const courseworkProjects = projectsData.filter(
    (p) => p.public && p.category === "site1101"
  );

  if (courseworkProjects.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align: center; padding: var(--space-8);">
        <p style="color: var(--color-text-muted);">Coursework projects are currently being prepared.</p>
      </div>
    `;
    return;
  }

  courseworkProjects.forEach((project) => {
    const article = document.createElement("article");
    const isPending = Boolean(project.isPending);

    article.className = `card ${isPending ? "card-coursework-pending" : "card-coursework-primary"}`;
    article.style.display = "flex";
    article.style.flexDirection = "column";
    article.style.justifyContent = "space-between";

    // Media / Screenshot Container with fallback
    const mediaHtml = `
      <div class="project-media-frame">
        <img src="${escapeHtml(project.image || '')}"
             alt="${escapeHtml(project.title)} Project Screenshot or Demonstration"
             class="project-media-img"
             onload="this.style.display='block'; this.nextElementSibling.style.display='none';"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="project-media-placeholder">
          ${getProjectIconSvg(project.id)}
          <span class="project-media-label">${escapeHtml(project.mediaLabel || 'Project Media')}</span>
          <span class="project-media-subtext">${escapeHtml(project.mediaPendingText || 'Media pending upload')}</span>
        </div>
      </div>
    `;

    // Video Embed (Exclusive to verified Project 1)
    let videoEmbedHtml = "";
    if (project.videoEmbedUrl) {
      videoEmbedHtml = `
        <div class="video-embed-container">
          <iframe src="${escapeHtml(project.videoEmbedUrl)}"
                  title="${escapeHtml(project.title)} Demonstration Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  loading="lazy">
          </iframe>
        </div>
      `;
    }

    // External Action Links
    let actionButtonsHtml = "";
    if (project.videoUrl) {
      actionButtonsHtml += `
        <a href="${escapeHtml(project.videoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          Watch on YouTube
        </a>
      `;
    }

    // Technology Tags
    const techTagsHtml = (project.technologies || [])
      .map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`)
      .join("");

    // Pending Notice Callout
    let pendingNoticeHtml = "";
    if (project.pendingNotice) {
      pendingNoticeHtml = `
        <div class="notice-box" style="margin-top: var(--space-3); margin-bottom: var(--space-4); font-size: var(--font-size-xs);">
          <strong>Status:</strong> ${escapeHtml(project.pendingNotice)}
        </div>
      `;
    }

    article.innerHTML = `
      <div>
        ${mediaHtml}
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-2); margin-bottom: var(--space-2);">
          <span class="badge ${isPending ? 'badge-warning' : 'badge-accent'}">${escapeHtml(project.statusLabel)}</span>
          <span class="badge" style="font-size: 0.7rem;">${escapeHtml(project.categoryLabel)}</span>
        </div>
        <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--space-2);">${escapeHtml(project.title)}</h3>
        <p style="font-size: var(--font-size-sm); margin-bottom: var(--space-3); line-height: 1.6;">${escapeHtml(project.description || project.summary)}</p>
        ${videoEmbedHtml}
        ${pendingNoticeHtml}
      </div>

      <div style="margin-top: var(--space-4);">
        <div class="tag-list" style="margin-bottom: ${actionButtonsHtml ? 'var(--space-4)' : '0'};">
          ${techTagsHtml}
        </div>
        ${actionButtonsHtml ? `<div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">${actionButtonsHtml}</div>` : ""}
      </div>
    `;

    container.appendChild(article);
  });
}

/**
 * Render Section B: Supplementary Personal & Machine Learning Projects
 */
function renderSupplementary(container, category) {
  container.innerHTML = "";

  const allSupplementary = projectsData.filter(
    (p) => p.public && p.category !== "site1101"
  );

  const filtered = category === "all"
    ? allSupplementary
    : allSupplementary.filter((p) => p.category === category);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align: center; padding: var(--space-8);">
        <p style="color: var(--color-text-muted);">No supplementary projects found in this category.</p>
      </div>
    `;
    return;
  }

  filtered.forEach((project) => {
    const article = document.createElement("article");
    article.className = "card";
    article.style.display = "flex";
    article.style.flexDirection = "column";
    article.style.justifyContent = "space-between";

    // Tech tags
    const techTagsHtml = (project.technologies || [])
      .map((tech) => `<span class="tech-tag">${escapeHtml(tech)}</span>`)
      .join("");

    // Links (render only if URL is verified and non-null)
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
        <p style="font-size: var(--font-size-sm); margin-bottom: var(--space-4); line-height: 1.6;">${escapeHtml(project.summary)}</p>
      </div>

      <div>
        <div class="tag-list" style="margin-bottom: ${linksHtml ? 'var(--space-4)' : '0'};">
          ${techTagsHtml}
        </div>
        ${linksHtml ? `<div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">${linksHtml}</div>` : ""}
      </div>
    `;

    container.appendChild(article);
  });
}

/**
 * SVG Icon helper for clean placeholder illustrations
 */
function getProjectIconSvg(projectId) {
  if (projectId === "site1101-project1") {
    // Hardware / Logic Circuit icon
    return `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`;
  }
  if (projectId === "site1101-hour-of-code") {
    // Outreach / Learning / People icon
    return `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  }
  if (projectId === "site1101-robotics") {
    // Robotics / Sensor / Automation icon
    return `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`;
  }
  return `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
