import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/cursos")({
  component: () => {
    // We should probably redirect to the index of courses or render the same as courses
    return null;
  },
  loader: () => {
    // In TanStack Router, we can't easily redirect from component if we want to stay on the same route structure
    // but we can just import the component from the other file if it exists.
  }
});