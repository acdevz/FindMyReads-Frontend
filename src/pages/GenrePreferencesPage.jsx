// src/pages/GenrePreferences.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchApi } from "../utils/api";

// Helper to map backend genre slugs to UI icons and labels
const getGenreMeta = (slug) => {
  const metaMap = {
    "science-fiction": { icon: "rocket_launch", label: "Exploration" },
    mystery: { icon: "search", label: "Suspense" },
    history: { icon: "history_edu", label: "Archival" },
    "non-fiction": { icon: "biotech", label: "Reality" },
    fantasy: { icon: "auto_fix_high", label: "Magic" },
    romance: { icon: "favorite", label: "Passion" },
    thriller: { icon: "bolt", label: "Intensity" },
  };
  return metaMap[slug] || { icon: "auto_stories", label: "Literature" };
};

export default function GenrePreferencesPage() {
  const [genres, setGenres] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await fetchApi("/api/genres");
        setGenres(data);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGenres();
  }, []);

  const handleSliderChange = (id, value) => {
    setPreferences((prev) => ({
      ...prev,
      [id]: parseInt(value, 10),
    }));
  };

  const submitPreferences = async (isSkip = false) => {
    setIsSubmitting(true);
    try {
      // API requires 1 to 20 items. If skipping, we send an empty map or default.
      // Assuming backend handles empty map gracefully if skipped, or we just navigate away.
      if (!isSkip) {
        // Enforce max 20 items
        const slicedPreferences = Object.fromEntries(
          Object.entries(preferences).slice(0, 20),
        );

        await fetchApi("/api/onboarding/complete", {
          method: "POST",
          body: JSON.stringify({ preferences: slicedPreferences }), // [cite: 229-232]
        });
      }

      // Update local context to reflect onboarding is done
      setUser((prev) => ({ ...prev, onboardingDone: true }));
      navigate("/home");
    } catch (error) {
      console.error("Submission failed:", error);
      alert(error.message || "Failed to save preferences.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate profile maturity (target ~5 genres rated for 100%)
  const ratedCount = Object.keys(preferences).length;
  const maturityPercent = Math.min(100, Math.round((ratedCount / 5) * 100));
  const circleCircumference = 2 * Math.PI * 20; // r=20
  const strokeDashoffset =
    circleCircumference - (maturityPercent / 100) * circleCircumference;
  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${user?.username || "Reader"}&background=a43700&color=fff&rounded=true`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            menu_book
          </span>
          <h1 className="font-headline text-2xl font-semibold italic text-primary">
            FindMyReads
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block font-label text-xs tracking-widest uppercase font-bold text-on-surface-variant">
            {user?.username}
          </span>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border border-outline-variant/20 shadow-sm">
            <img
              src={avatarUrl}
              alt={`${user?.username}'s avatar`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="pt-24 pb-40 px-6 max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="mb-16">
          <span className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary mb-3 block">
            Personalization
          </span>
          <h2 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-on-surface leading-tight mb-6">
            Define Your <br />
            <span className="italic text-primary">Literary Taste.</span>
          </h2>
          <p className="font-body text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed">
            Tell us what you love to read to help us find your next favorite.
            Every preference shapes your unique library algorithm.
          </p>
        </section>

        {/* Genre Selection Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {genres.map((genre) => {
            const meta = getGenreMeta(genre.slug);
            const currentValue = preferences[genre.id] || 3;
            const isInteracted = preferences.hasOwnProperty(genre.id);

            return (
              <div
                key={genre.id}
                className={`group p-8 rounded-xl border transition-all duration-300 ${
                  isInteracted
                    ? "bg-surface-container-lowest border-primary/40 shadow-sm"
                    : "bg-surface-container-lowest border-outline-variant/10 hover:border-primary/20"
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span
                      className={`material-symbols-outlined text-3xl mb-4 block ${isInteracted ? "text-primary" : "text-secondary"}`}
                    >
                      {meta.icon}
                    </span>
                    <h3 className="font-headline text-2xl font-bold">
                      {genre.name}
                    </h3>
                  </div>
                  <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                    {meta.label}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center font-label text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                    <span>Interest Level</span>
                    <span
                      className={
                        isInteracted
                          ? "text-primary"
                          : "text-on-surface-variant"
                      }
                    >
                      {currentValue} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentValue}
                    onChange={(e) =>
                      handleSliderChange(genre.id, e.target.value)
                    }
                    className="w-full h-1 bg-surface-container-highest rounded-full appearance-none outline-none"
                    style={{
                      accentColor: isInteracted
                        ? "var(--color-primary)"
                        : "var(--color-on-surface-variant)",
                      cursor: "pointer",
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant/60 font-medium">
                    <span>Casual</span>
                    <span>Devoted</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom Add Card (Visual placeholder per design) */}
          <div className="group bg-surface-container-low p-8 rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center hover:bg-surface-container transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-secondary">
                add
              </span>
            </div>
            <h3 className="font-headline text-xl font-semibold mb-2">
              Something Else?
            </h3>
            <p className="font-body text-sm text-on-surface-variant">
              Add a custom genre or sub-category to your profile.
            </p>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-surface-bright/80 backdrop-blur-xl border-t border-outline-variant/10 px-6 py-6 z-50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="transparent"
                    stroke="var(--color-surface-container-highest)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="transparent"
                    stroke="var(--color-primary)"
                    strokeWidth="4"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-label text-[10px] font-extrabold text-on-surface">
                    {maturityPercent}%
                  </span>
                </div>
              </div>
              <div>
                <p className="font-label text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                  Profile Maturity
                </p>
                <p className="font-body text-sm text-on-surface-variant/70 italic">
                  {maturityPercent >= 100
                    ? "Ready to curate your library."
                    : "Almost ready for your first recommendation..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => submitPreferences(true)}
                disabled={isSubmitting}
                className="flex-1 md:flex-none px-8 py-4 font-label text-xs font-extrabold uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
              <button
                onClick={() => submitPreferences(false)}
                disabled={isSubmitting || ratedCount === 0}
                className="flex-1 md:flex-none px-12 py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-label text-xs font-extrabold uppercase tracking-[0.2em] shadow-[0_12px_32px_rgba(164,55,0,0.2)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
              >
                {isSubmitting ? "Saving..." : "Finish Profile"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
    </div>
  );
}
