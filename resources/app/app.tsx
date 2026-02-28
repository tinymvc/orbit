import "./app.css";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

import { AppProvider } from "@/contexts/app";
import Dashboard from "@/layouts/dashboard";

interface PageComponent {
  default: React.ComponentType<any> & {
    layout?: (page: React.ReactNode) => React.ReactNode;
  };
}

createInertiaApp({
  resolve: async (name) => {
    // Lazy import — each page becomes its own chunk (code splitting)
    const pages = import.meta.glob<PageComponent>("./pages/**/*.tsx");
    const resolver = pages[`./pages/${name}.tsx`];

    if (!resolver) {
      throw new Error(`Page not found: ${name}`);
    }

    const page = await resolver();

    if (name.startsWith("admin/")) {
      page.default.layout = (pageContent: React.ReactNode) => (
        <AppProvider>
          <Dashboard>{pageContent}</Dashboard>
        </AppProvider>
      );
    } else {
      page.default.layout = (pageContent: React.ReactNode) => (
        <AppProvider>{pageContent}</AppProvider>
      );
    }

    return page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
  progress: {
    color: "#f43f5e", // Rose-500 — a vibrant red color for the progress bar
    showSpinner: false, // Optional: hide the spinner for a cleaner look
  },
});
