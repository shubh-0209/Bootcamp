/**
 * drag.js — Native HTML5 Drag & Drop, wired entirely through event delegation
 * on the board container. No per-card listeners.
 */

const clearDropMarkers = (boardEl) => {
  boardEl
    .querySelectorAll(".drop-before, .drop-after")
    .forEach((el) => el.classList.remove("drop-before", "drop-after"));
  boardEl.querySelectorAll(".column.is-over").forEach((el) => el.classList.remove("is-over"));
};

/**
 * @param {HTMLElement} boardEl
 * @param {(payload: {draggedId: string, status: string, beforeId: string|null}) => void} onDrop
 */
export const initDragAndDrop = (boardEl, onDrop) => {
  let draggedId = null;

  boardEl.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".task");
    if (!card) return;
    draggedId = card.dataset.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedId);
    // Delay so the browser snapshots the card before it fades.
    requestAnimationFrame(() => card.classList.add("dragging"));
  });

  boardEl.addEventListener("dragend", () => {
    draggedId = null;
    boardEl.querySelectorAll(".task.dragging").forEach((el) => el.classList.remove("dragging"));
    clearDropMarkers(boardEl);
  });

  boardEl.addEventListener("dragover", (event) => {
    const column = event.target.closest(".column");
    if (!column || !draggedId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    clearDropMarkers(boardEl);
    column.classList.add("is-over");

    const card = event.target.closest(".task");
    if (card && card.dataset.id !== draggedId) {
      const { top, height } = card.getBoundingClientRect();
      card.classList.add(event.clientY < top + height / 2 ? "drop-before" : "drop-after");
    }
  });

  boardEl.addEventListener("dragleave", (event) => {
    const column = event.target.closest(".column");
    if (column && !column.contains(event.relatedTarget)) column.classList.remove("is-over");
  });

  boardEl.addEventListener("drop", (event) => {
    const column = event.target.closest(".column");
    if (!column) return;
    event.preventDefault();

    const id = draggedId ?? event.dataTransfer.getData("text/plain");
    if (!id) return;

    const marker = boardEl.querySelector(".drop-before, .drop-after");
    let beforeId = null;
    if (marker) {
      beforeId = marker.classList.contains("drop-before")
        ? marker.dataset.id
        : (marker.nextElementSibling?.dataset.id ?? null);
    }

    clearDropMarkers(boardEl);
    draggedId = null;
    onDrop({ draggedId: id, status: column.dataset.status, beforeId });
  });
};