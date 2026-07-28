/**
 * storage.js — LocalStorage persistence layer.
 * Tasks are stored as a flat array; order within the array defines card order.
 */

const STORAGE_KEY = "kanban.tasks.v1";

export const STATUSES = ["todo", "progress", "done"];

/** Read all tasks from LocalStorage. Returns [] when empty or corrupted. */
export const loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t) => t && t.id && t.title) : [];
  } catch (error) {
    console.warn("Could not read saved tasks:", error);
    return [];
  }
};

/** Persist the full task list (order included). */
export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.warn("Could not save tasks:", error);
    return false;
  }
};

/** Small unique id helper (crypto when available). */
export const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** Demo tasks used only on the very first visit. */
export const seedTasks = () => {
  const now = new Date().toISOString();
  return [
    {
      id: createId(),
      title: "Design the onboarding flow",
      description: "Three screens: welcome, workspace setup, first task.",
      priority: "high",
      dueDate: "",
      category: "Design",
      status: "todo",
      createdAt: now,
    },
    {
      id: createId(),
      title: "Build the board layout",
      description: "CSS Grid columns with responsive stacking.",
      priority: "medium",
      dueDate: "",
      category: "Frontend",
      status: "progress",
      createdAt: now,
    },
    {
      id: createId(),
      title: "Set up the project",
      description: "Folder structure, base styles and modules.",
      priority: "low",
      dueDate: "",
      category: "Setup",
      status: "done",
      createdAt: now,
    },
  ];
};