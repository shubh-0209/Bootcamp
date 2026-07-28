/**
 * ui.js — Rendering layer. Pure DOM building, no state mutation.
 */

export const COLUMNS = [
  { status: "todo", label: "To Do", empty: "Nothing here yet — add your first task." },
  { status: "progress", label: "In Progress", empty: "Drag a task here to start working." },
  { status: "done", label: "Done", empty: "Completed work lands here." },
];

const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High" };

const ICONS = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
};

/** Escape user content before it touches innerHTML. */
const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );

export const formatDate = (iso, options = { month: "short", day: "numeric" }) => {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, options);
};

const isOverdue = (dueDate, status) => {
  if (!dueDate || status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dueDate}T00:00:00`) < today;
};

/** Build a single task card element. */
export const createTaskCard = (task) => {
  const { id, title, description, priority, dueDate, category, status, createdAt } = task;
  const li = document.createElement("li");
  li.className = "task";
  li.draggable = true;
  li.dataset.id = id;
  li.tabIndex = 0;
  li.setAttribute("role", "listitem");
  li.setAttribute("aria-roledescription", "Draggable task");
  li.setAttribute("aria-label", `${title}. Priority ${PRIORITY_LABEL[priority] ?? priority}.`);

  const due = dueDate
    ? `<span class="chip chip-due ${isOverdue(dueDate, status) ? "is-overdue" : ""}">Due ${escapeHtml(
        formatDate(dueDate),
      )}</span>`
    : "";
  const cat = category ? `<span class="chip">${escapeHtml(category)}</span>` : "";
  const desc = description ? `<p class="task-desc">${escapeHtml(description)}</p>` : "";

  li.innerHTML = `
    <div class="task-top">
      <span class="drag-handle" aria-hidden="true" title="Drag to move">⠿</span>
      <span class="badge badge-${escapeHtml(priority)}">${PRIORITY_LABEL[priority] ?? "Medium"}</span>
      <div class="task-tools">
        <button type="button" class="icon-btn" data-action="edit" aria-label="Edit task: ${escapeHtml(title)}">${ICONS.edit}</button>
        <button type="button" class="icon-btn danger" data-action="delete" aria-label="Delete task: ${escapeHtml(title)}">${ICONS.trash}</button>
      </div>
    </div>
    <h3 class="task-title">${escapeHtml(title)}</h3>
    ${desc}
    <div class="task-meta">
      ${due}${cat}
      <time class="task-created" datetime="${escapeHtml(createdAt ?? "")}">${escapeHtml(
        formatDate(createdAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      )}</time>
    </div>`;

  return li;
};

/** Build the three empty columns once. */
export const renderBoardSkeleton = (boardEl) => {
  const fragment = document.createDocumentFragment();

  COLUMNS.forEach(({ status, label }) => {
    const section = document.createElement("section");
    section.className = "column";
    section.dataset.status = status;
    section.setAttribute("aria-labelledby", `col-${status}`);
    section.innerHTML = `
      <div class="column-head">
        <span class="column-dot" aria-hidden="true"></span>
        <h2 class="column-title" id="col-${status}">${label}</h2>
        <span class="column-count" data-count="${status}" aria-hidden="true">0</span>
      </div>
      <ul class="task-list" role="list" data-list="${status}" aria-labelledby="col-${status}"></ul>`;
    fragment.append(section);
  });

  boardEl.replaceChildren(fragment);
};

/** Render tasks into every column using a DocumentFragment per list. */
export const renderTasks = (boardEl, tasks) => {
  COLUMNS.forEach(({ status, empty }) => {
    const list = boardEl.querySelector(`[data-list="${status}"]`);
    const counter = boardEl.querySelector(`[data-count="${status}"]`);
    const columnTasks = tasks.filter((task) => task.status === status);

    const fragment = document.createDocumentFragment();
    if (columnTasks.length === 0) {
      const placeholder = document.createElement("li");
      placeholder.className = "empty-state";
      placeholder.textContent = empty;
      fragment.append(placeholder);
    } else {
      columnTasks.forEach((task) => fragment.append(createTaskCard(task)));
    }

    list.replaceChildren(fragment);
    counter.textContent = String(columnTasks.length);
  });
};

/** Announce a message to screen readers. */
export const announce = (message) => {
  const region = document.getElementById("liveRegion");
  if (region) region.textContent = message;
};