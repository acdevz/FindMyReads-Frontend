// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchApi } from "../utils/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [deviation, setDeviation] = useState(user?.deviation_alpha || 0.2);
  const [isSavingDeviation, setIsSavingDeviation] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${user?.username || "Reader"}&background=a43700&color=fff&rounded=true&size=256`;

  // Handler for the deviation knob
  const handleDeviationChange = async (e) => {
    const newValue = parseFloat(e.target.value);
    setDeviation(newValue);
  };

  // Save the deviation when the user stops dragging the slider
  const saveDeviation = async () => {
    setIsSavingDeviation(true);
    setSaveMessage("");
    try {
      await fetchApi("/api/me/deviation", {
        method: "PATCH",
        body: JSON.stringify({ alpha: deviation }),
      });
      setSaveMessage("Algorithm updated.");
      setTimeout(() => setSaveMessage(""), 3000); // Clear message after 3s
    } catch (error) {
      console.error("Failed to update deviation:", error);
      setSaveMessage("Failed to update.");
    } finally {
      setIsSavingDeviation(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Determine descriptive text based on slider value
  const getDeviationDescription = () => {
    if (deviation < 0.3)
      return "Strict & Safe. Sticks closely to your established shelf.";
    if (deviation < 0.7)
      return "Balanced. Introduces gentle variations of your favorite themes.";
    return "Adventurous. High chance of discovering wildly different wildcard genres.";
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-center items-center px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <h1 className="font-headline text-2xl font-semibold italic text-primary">
          Your Passport
        </h1>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-12">
        {/* User Identity Section */}
        <section className="animate-fade-in-up flex flex-col items-center text-center mt-4">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-surface-container overflow-hidden border-4 border-surface shadow-xl z-10 relative">
              <img
                src={avatarUrl}
                alt="User profile avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative backing */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border border-primary/20 rounded-full -z-0"></div>
          </div>

          <h2 className="font-headline text-4xl font-bold mb-1">
            {user?.username || "Avid Reader"}
          </h2>
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">
            {user?.email || "reader@findmyreads.com"}
          </p>

          {/* Quick Stats (Optional based on what /api/me returns) */}
          <div className="flex gap-6 mt-8">
            <div className="flex flex-col items-center">
              <span className="font-headline text-2xl text-primary font-bold">
                {user?.booksCount || 0}
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
                Books Discovered
              </span>
            </div>
            <div className="w-px bg-outline-variant/30"></div>
            <div className="flex flex-col items-center">
              <span className="font-headline text-2xl text-secondary font-bold">
                {user?.scansCount || 0}
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
                Shelves Scanned
              </span>
            </div>
          </div>
        </section>

        {/* Algorithm Control (The Deviation Knob) */}
        <section
          className="bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] p-6 shadow-sm animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-headline text-2xl font-semibold mb-1">
                Literary Deviation
              </h3>
              <p className="font-body text-sm text-on-surface-variant max-w-sm leading-relaxed">
                Tune the AI algorithm. Lower values yield safe recommendations;
                higher values encourage wild, exploratory discoveries.
              </p>
            </div>
            <span className="hidden md:block font-headline text-3xl font-bold text-primary/30 italic">
              {deviation.toFixed(2)}
            </span>
          </div>

          <div className="py-6">
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={deviation}
              onChange={handleDeviationChange}
              onMouseUp={saveDeviation}
              onTouchEnd={saveDeviation}
              className="w-full h-2 bg-surface-container-highest rounded-full appearance-none outline-none cursor-pointer"
              style={{
                accentColor: "var(--color-primary)",
              }}
            />
            <div className="flex justify-between mt-3 font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60">
              <span>Familiar</span>
              <span>Adventurous</span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-4 flex justify-between items-center transition-all">
            <span className="font-body text-sm text-on-surface-variant/90 italic">
              "{getDeviationDescription()}"
            </span>
            {isSavingDeviation ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : saveMessage ? (
              <span className="font-label text-xs font-bold text-tertiary uppercase tracking-widest animate-pulse">
                {saveMessage}
              </span>
            ) : null}
          </div>
        </section>

        {/* Account Actions */}
        <section
          className="space-y-4 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <button
            onClick={() => navigate("/onboarding/genres")}
            className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">
                tune
              </span>
              <span className="font-headline text-xl font-medium">
                Retake Genre Quiz
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors">
              chevron_right
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/10 hover:bg-error/5 hover:border-error/30 hover:text-error transition-all group"
          >
            <div className="flex items-center gap-4 text-on-surface-variant group-hover:text-error transition-colors">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-headline text-xl font-medium">
                Sign Out
              </span>
            </div>
          </button>
        </section>

        {/* Footer info */}
        <div className="text-center pt-8 pb-4">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 font-bold">
            FindMyReads v1.0.0
          </span>
        </div>
      </main>
    </div>
  );
}
