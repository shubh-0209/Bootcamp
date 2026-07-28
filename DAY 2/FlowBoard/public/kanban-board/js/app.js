/**
 * app.js — Application entry point: state, events (delegated) and wiring.
 */

import { loadTasks, saveTasks, seedTasks, createId, STATUSES } from "./storage.js";
import { renderBoardSkeleton, renderTasks, announce, formatDate } from "./ui.js";
import { initDragAndDrop } from "./drag.js";
import { fetchQuote } from "./api.js";

/* ----------------------------- element refs ----------------------------- */
const $ = (selector) => document.querySelector(selector);

const boardEl = $("#board");
const quoteEl = $(".quote");
const quoteText = $("#quoteText");
const quoteAuthor = $("#quoteAuthor");
const newQuoteBtn = $("#newQuoteBtn");
const addTaskBtn = $("#addTaskBtn");
const clearDoneBtn = $("#clearDoneBtn");
const taskOverlay = $("#taskOverlay");
const taskForm = $("#taskForm");
const taskModalTitle = $("#taskModalTitle");
const taskSubmitBtn = $("#taskSubmitBtn");
const titleError = $("#titleError");
const confirmOverlay = $("#confirmOverlay");
const confirmDeleteBtn = $("#confirmDeleteBtn");
const statsLine = $("#statsLine");
const backToTop = $("#backToTop");

/* -------------------------------- state --------------------------------- */
let tasks = loadTasks();
if (tasks.length === 0 && !localStorage.getItem("kanban.seeded")) {
  tasks = seedTasks();
  localStorage.setItem("kanban.seeded", "1");
  saveTasks(tasks);
}

let editingId = null;
let pendingDeleteId = null;
let lastFocused = null;

/* ------------------------------- rendering ------------------------------ */
const updateStats = () => {
  const done = tasks.filter(({ status }) => status === "done").length;
  statsLine.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"} · ${done} done`;
};

const render = () => {
  renderTasks(boardEl, tasks);
  updateStats();
};

const persist = () => saveTasks(tasks);

const commit = () => {
  persist();
  render();
};

/* --------------------------------- modals -------------------------------- */
const openOverlay = (overlay, focusTarget) => {
  lastFocused = document.activeElement;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  (focusTarget ?? overlay.querySelector("button, input")).focus();
};

const closeOverlay = (overlay) => {
  overlay.hidden = true;
  document.body.style.overflow = "";
  lastFocused?.focus?.();
};

const openTaskModal = (task = null) => {
  editingId = task?.id ?? null;
  titleError.hidden = true;
  taskModalTitle.textContent = task ? "Edit task" : "New task";
  taskSubmitBtn.textContent = task ? "Save changes" : "Add task";

  const {
    title = "",
    description = "",
    priority = "medium",
    dueDate = "",
    category = "",
    status = "todo",
  } = task ?? {};

  taskForm.title.value = title;
  taskForm.description.value = description;
  taskForm.priority.value = priority;
  taskForm.dueDate.value = dueDate;
  taskForm.category.value = category;
  taskForm.status.value = status;

  openOverlay(taskOverlay, taskForm.title);
};

/* ------------------------------ task actions ----------------------------- */
const findTask = (id) => tasks.find((task) => task.id === id);

const upsertTask = (values) => {
  if (editingId) {
    tasks = tasks.map((task) => (task.id === editingId ? { ...task, ...values } : task));
    announce(`Task updated: ${values.title}`);
  } else {
    tasks = [
      ...tasks,
      { id: createId(), createdAt: new Date().toISOString(), ...values },
    ];
    announce(`Task added: ${values.title}`);
  }
  commit();
};

const deleteTask = (id) => {
  const task = findTask(id);
  tasks = tasks.filter((item) => item.id !== id);
  commit();
  announce(`Task deleted: ${task?.title ?? ""}`);
};

/** Move a task to a status and position (before `beforeId`, or to the end). */
const moveTask = ({ draggedId, status, beforeId }) => {
  const dragged = findTask(draggedId);
  if (!dragged || !STATUSES.includes(status)) return;

  const remaining = tasks.filter((task) => task.id !== draggedId);
  const updated = { ...dragged, status };
  const index = beforeId ? remaining.findIndex((task) => task.id === beforeId) : -1;

  tasks =
    index === -1
      ? [...remaining, updated]
      : [...remaining.slice(0, index), updated, ...remaining.slice(index)];

  commit();
  announce(`${updated.title} moved to ${status}`);
};

/* -------------------------- delegated board events ----------------------- */
boardEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { id } = button.closest(".task").dataset;
  const { action } = button.dataset;

  if (action === "edit") openTaskModal(findTask(id));
  if (action === "delete") {
    pendingDeleteId = id;
    openOverlay(confirmOverlay, confirmDeleteBtn);
  }
});

// Keyboard alternative to dragging: move focused card with arrow keys.
boardEl.addEventListener("keydown", (event) => {
  const card = event.target.closest(".task");
  if (!card) return;
  const task = findTask(card.dataset.id);
  if (!task) return;

  if (event.key === "Enter") {
    event.preventDefault();
    openTaskModal(task);
    return;
  }
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

  event.preventDefault();
  const next = STATUSES.indexOf(task.status) + (event.key === "ArrowRight" ? 1 : -1);
  if (next < 0 || next >= STATUSES.length) return;
  moveTask({ draggedId: task.id, status: STATUSES[next], beforeId: null });
  boardEl.querySelector(`.task[data-id="${task.id}"]`)?.focus();
});

initDragAndDrop(boardEl, moveTask);

/* ------------------------------ form events ------------------------------ */
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(taskForm).entries());
  const title = data.title.trim();

  if (!title) {
    titleError.hidden = false;
    taskForm.title.focus();
    return;
  }

  titleError.hidden = true;
  upsertTask({
    ...data,
    title,
    description: data.description.trim(),
    category: data.category.trim(),
  });
  closeOverlay(taskOverlay);
});

// Delegated close handling for both overlays (backdrop + cancel buttons).
document.addEventListener("click", (event) => {
  const overlay = event.target.closest(".overlay");
  if (!overlay) return;
  if (event.target === overlay || event.target.closest("[data-close-modal]")) {
    closeOverlay(overlay);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  [taskOverlay, confirmOverlay].filter((o) => !o.hidden).forEach(closeOverlay);
});

confirmDeleteBtn.addEventListener("click", () => {
  if (pendingDeleteId) deleteTask(pendingDeleteId);
  pendingDeleteId = null;
  closeOverlay(confirmOverlay);
});

addTaskBtn.addEventListener("click", () => openTaskModal());

clearDoneBtn.addEventListener("click", () => {
  const before = tasks.length;
  tasks = tasks.filter(({ status }) => status !== "done");
  if (tasks.length !== before) {
    commit();
    announce("Completed tasks cleared");
  }
});

/* -------------------------------- quotes --------------------------------- */
const loadQuote = async () => {
  quoteEl.classList.add("is-loading");
  quoteEl.classList.remove("is-error");
  newQuoteBtn.disabled = true;
  quoteText.textContent = "Loading a quote…";
  quoteAuthor.textContent = "";

  const { ok, quote } = await fetchQuote();
  const { text, author } = quote;

  quoteText.textContent = `“${text}”`;
  quoteAuthor.textContent = ok ? `— ${author}` : "Couldn't reach the quote service — showing a saved one.";
  quoteEl.classList.toggle("is-error", !ok);
  quoteEl.classList.remove("is-loading");
  newQuoteBtn.disabled = false;
};

newQuoteBtn.addEventListener("click", loadQuote);

/* ------------------------------ misc chrome ------------------------------ */
$("#todayDate").textContent = formatDate(new Date().toISOString(), {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
window.addEventListener(
  "scroll",
  () => backToTop.classList.toggle("is-visible", window.scrollY > 320),
  { passive: true },
);

/* --------------------------------- boot ---------------------------------- */
renderBoardSkeleton(boardEl);
render();
loadQuote();