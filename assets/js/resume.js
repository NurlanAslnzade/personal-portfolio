/**
 * resume.js - Resume View Mode Toggle & Neural Path Foundation
 * Consumes profile-data.js for interactive milestone inspection.
 */

import { profileData } from "./data/profile-data.js";

document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".mode-toggle-btn");
  const conventionalSection = document.getElementById("conventional-resume");
  const neuralPathSection = document.getElementById("neural-path-foundation");
  const printButton = document.getElementById("print-resume-btn");

  if (!conventionalSection || !neuralPathSection) return;

  // Toggle between Conventional CV and Neural Path Mode
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      toggleButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");

      if (mode === "conventional") {
        conventionalSection.style.display = "block";
        neuralPathSection.style.display = "none";
      } else {
        conventionalSection.style.display = "none";
        neuralPathSection.style.display = "block";
      }
    });
  });

  // Print CV button
  if (printButton) {
    printButton.addEventListener("click", () => {
      // Ensure conventional view is active for printing
      conventionalSection.style.display = "block";
      neuralPathSection.style.display = "none";
      window.print();
    });
  }

  // Neural Path Node Selection using canonical profileData
  const milestoneButtons = document.querySelectorAll(".milestone-node-btn");
  const inspectTitle = document.getElementById("inspect-node-title");
  const inspectType = document.getElementById("inspect-node-type");
  const inspectDetails = document.getElementById("inspect-node-details");

  const milestones = profileData.neuralPathMilestones || [];

  if (milestoneButtons.length > 0 && inspectTitle && inspectDetails) {
    milestoneButtons.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        milestoneButtons.forEach((b) => {
          b.classList.remove("is-selected");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-selected");
        btn.setAttribute("aria-selected", "true");

        // Retrieve data directly from canonical profileData
        const milestone = milestones[index];
        if (milestone) {
          inspectTitle.textContent = milestone.fullTitle;
          inspectType.textContent = milestone.type;
          inspectDetails.textContent = milestone.details;
        } else {
          // Fallback to HTML data attributes if index mismatch
          inspectTitle.textContent = btn.getAttribute("data-title") || "";
          inspectType.textContent = btn.getAttribute("data-type") || "";
          inspectDetails.textContent = btn.getAttribute("data-desc") || "";
        }
      });
    });
  }
});
