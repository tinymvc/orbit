import "./app.css";

import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

import { AppProvider } from "@/contexts/app";
import Dashboard from "@/layouts/dashboard";

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>("./pages/**/*.tsx", {
      eager: true,
    });
    const page = pages[`./pages/${name}.tsx`] as any;

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
});
