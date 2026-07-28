import { createFileRoute } from "@tanstack/react-router";

const TITLE = "Kanban Task Board — Plan, Track & Ship Work";
const DESCRIPTION =
  "A fast, accessible Kanban board with native HTML5 drag & drop, priorities, due dates and offline-ready local storage.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/**
 * The board itself is a standalone vanilla HTML/CSS/JS app served from
 * /kanban-board/. This route embeds it full-screen at "/".
 */
function Index() {
  return (
    <iframe
      src="/kanban-board/index.html"
      title="Kanban Task Board"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}
