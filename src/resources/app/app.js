/**
 * aap.js
 *
 * This file is the entry point of the Vite application. It contains the
 * necessary code to initialize the application and mount the root
 * component to the DOM.
 *
 * When the application is built, Vite uses this file as the input and
 * generates a bundle that can be loaded by the browser.
 *
 * @module aap
 */

import "./app.css";
import Alpine from "alpinejs";
import axios from "axios";
import fireline from "fireline";
import NProgress from "nprogress";

window.Alpine = Alpine;
window.axios = axios;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

document.addEventListener("alpine:init", () => {
  // Configure FireLine settings
  // Enable automatic handling of anchor links and form submits
  window.FireLine.settings = {
    targetEl: "#root > div",
    timeout: 30,
    interceptLinks: true,
    interceptForms: true,
  };

  Alpine.data("app", (setup) => ({
    init() {
      console.log("App initialized with setup:", setup);
    },
    isMenuActive(slug, children = []) {
      // remove query params and trailing slashes
      const cleanCurrent = this.$fire.current.split("?")[0].replace(/\/+$/, "");
      const targetPath = `/${setup.prefix}/${slug}`
        .replace(/\/+$/, "")
        .trim("/");
      // Check for exact match
      if (cleanCurrent.endsWith(targetPath)) {
        return true;
      }
      // Check for children paths
      for (const child of children) {
        const childPath = `/${setup.prefix}/${child}`
          .replace(/\/+$/, "")
          .trim("/");
        if (cleanCurrent.endsWith(childPath)) {
          return true;
        }
      }
      return false;
    },
    user() {
      return setup.user;
    },
    currentMenu() {
      const currentPath = this.$fire.current.split("?")[0].replace(/\/+$/, "");
      for (const item of setup.menu) {
        const itemPath = `/${setup.prefix}/${item.slug}`
          .replace(/\/+$/, "")
          .trim("/");
        if (currentPath.endsWith(itemPath)) {
          return item;
        }
        // Check children
        if (item.children) {
          for (const child of item.children) {
            const childPath = `/${setup.prefix}/${child.slug}`
              .replace(/\/+$/, "")
              .trim("/");
            if (currentPath.endsWith(childPath)) {
              return { ...item, children: child };
            }
          }
        }
      }
      return null;
    },
  }));

  Alpine.data("fileUpload", (name, value) => ({
    preview: value || null,
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.preview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
  }));
});

document.addEventListener("fireStart", () => {
  NProgress.start();
});

document.addEventListener("fireEnd", () => {
  NProgress.done();
  window.scrollTo({ top: 0 });
});

document.addEventListener("fireError", () => {
  NProgress.done();

  window.FireLine.context.replaceHtml(
    `<div>
        <div class="flex items-center justify-center px-4 py-20 lg:py-32">
            <div class="max-w-2xl mx-auto text-center">
                <div class="relative mb-8">
                    <h1 class="text-8xl md:text-9xl font-bold text-primary-500 leading-none tracking-tight animate-pulse">Error</h1>
                    <div class="absolute inset-0 text-8xl md:text-9xl font-bold text-primary-100 leading-none tracking-tight transform translate-x-2 translate-y-2 -z-10">Error</div>
                </div>
                <div class="mb-8">
                    <h2 class="text-2xl md:text-3xl font-semibold text-content mb-4">Something went wrong!</h2>
                    <p class="text-lg text-content/70 max-w-md mx-auto leading-relaxed">
                        Failed to load the requested content. Please try again later or contact support if the issue persists.
                    </p>
                </div>
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button @click="$fire.reload()"
                        class="group px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-200">
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Reload
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>`,
  );
});

Alpine.plugin(fireline);
Alpine.start();
