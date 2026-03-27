// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function MainLayout() {
  // Helper function to dynamically assign classes based on active state
  const getNavClasses = (isActive) => {
    const baseClasses =
      "flex flex-col items-center justify-center px-8 py-2 transition-all";
    const activeClasses =
      "text-primary bg-surface-container rounded-[1.5rem] scale-105";
    const inactiveClasses = "text-on-surface/60 hover:text-primary";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="pb-24 bg-surface min-h-screen">
      {/* The current screen content (Home, Library, Profile) */}
      <Outlet />

      {/* Dynamic Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-bright/80 backdrop-blur-xl border-t border-on-surface/10 shadow-[0_-4px_24px_rgba(27,28,26,0.04)] rounded-t-[1.5rem]">
        <NavLink
          to="/home"
          className={({ isActive }) => getNavClasses(isActive)}
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined mb-1"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                document_scanner
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">
                Home
              </span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) => getNavClasses(isActive)}
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined mb-1"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                library_books
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">
                Library
              </span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => getNavClasses(isActive)}
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined mb-1"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                person
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">
                Profile
              </span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
