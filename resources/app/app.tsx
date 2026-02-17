import "./app.css";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

import Dashboard from "@/layouts/dashboard";

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("./pages/**/*.tsx", { eager: true });
    const page = pages[`./pages/${name}.tsx`];

    page.default.layout = name.startsWith("admin/")
      ? undefined
      : (page: React.ReactNode) => <Dashboard children={page} />;

    return page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
