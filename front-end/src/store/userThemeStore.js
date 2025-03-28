import { create } from "zustand";

export const userThemeStore = create((set) =>({
    theme: localStorage.getItem("app-theme") || "coffee",
    setTheme: (theme) => {
        localStorage.setItem("app-theme", theme);
        set({ theme });
    },
}) );