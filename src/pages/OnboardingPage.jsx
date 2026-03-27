// src/pages/OnboardingPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchApi } from "../utils/api";

const getGenreMeta = (slug) => {
  const metaMap = {
    // Parents
    fiction: { icon: "menu_book", label: "Storytelling" },
    "sci-fi-fantasy": { icon: "auto_fix_high", label: "Imagination" },
    "mystery-thriller": { icon: "search", label: "Suspense" },
    "business-economics": { icon: "trending_up", label: "Commerce" },
    "history-biography": { icon: "history_edu", label: "Real Life" },
    "science-lifestyle": { icon: "biotech", label: "Knowledge" },
    poetry: { icon: "format_quote", label: "Lyrical" },

    // Fiction Children
    "historical-fiction": { icon: "castle", label: "Past Eras" },
    romance: { icon: "favorite", label: "Passion" },
    "literary-fiction": { icon: "local_library", label: "Artistic" },
    "young-adult": { icon: "backpack", label: "Coming of Age" },

    // Sci-Fi & Fantasy Children
    "science-fiction": { icon: "rocket_launch", label: "Future Tech" },
    "epic-fantasy": { icon: "shield", label: "World Building" },
    dystopian: { icon: "warning", label: "Gritty Futures" },
    paranormal: { icon: "dark_mode", label: "Supernatural" },

    // Mystery & Thriller Children
    "crime-detective": { icon: "fingerprint", label: "Investigation" },
    "psychological-thriller": { icon: "psychology", label: "Mind Games" },
    "suspense-espionage": { icon: "domino_mask", label: "High Stakes" },
    "cozy-mystery": { icon: "local_cafe", label: "Lighthearted" },

    // Business & Economics Children
    "economics-finance": { icon: "account_balance", label: "Markets" },
    entrepreneurship: { icon: "lightbulb", label: "Startups" },
    "management-leadership": { icon: "groups", label: "Strategy" },
    "personal-finance": { icon: "savings", label: "Wealth" },

    // History & Biography Children
    "world-history": { icon: "public", label: "Civilizations" },
    "memoir-biography": { icon: "face", label: "True Stories" },
    politics: { icon: "gavel", label: "Power" },
    "military-history": { icon: "military_tech", label: "Warfare" },

    // Science & Mind Children
    "psychology-self-help": { icon: "self_improvement", label: "Growth" },
    "tech-computers": { icon: "terminal", label: "Digital" },
    "hard-science": { icon: "science", label: "Discovery" },
    "philosophy-sociology": { icon: "account_tree", label: "Meaning" },

    // Poetry & Verse
    "classic-poetry": { icon: "museum", label: "Timeless" },
    "contemporary-poetry": { icon: "flare", label: "Modern" },
    "epic-poetry": { icon: "landscape", label: "Mythic" },
    "spoken-word": { icon: "mic", label: "Performance" },
  };
  return metaMap[slug] || { icon: "auto_stories", label: "Category" };
};

export default function OnboardingPage() {
  const [mainGenres, setMainGenres] = useState([]);
  const [subGenresByParent, setSubGenresByParent] = useState({});
  const [preferences, setPreferences] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation state: 'next', 'prev', or null
  const [animDir, setAnimDir] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await fetchApi("/api/genres");
        const mains = data.filter((g) => !g.parent_id && !g.parentId);
        const subs = data.filter((g) => g.parent_id || g.parentId);

        const subsMap = {};
        subs.forEach((sub) => {
          const actualParentId = sub.parent_id || sub.parentId;
          if (!subsMap[actualParentId]) subsMap[actualParentId] = [];
          subsMap[actualParentId].push(sub);
        });

        setMainGenres(mains);
        setSubGenresByParent(subsMap);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGenres();
  }, []);

  const activeQueue = useMemo(() => {
    const queue = [];
    mainGenres.forEach((parent) => {
      queue.push({ ...parent, isSub: false, parentName: null });
      if ((preferences[parent.id] || 0) >= 3) {
        const children = subGenresByParent[parent.id] || [];
        children.forEach((child) => {
          queue.push({
            ...child,
            isSub: true,
            parentName: parent.name,
            parentSlug: parent.slug,
          });
        });
      }
    });
    return queue;
  }, [mainGenres, subGenresByParent, preferences]);

  useEffect(() => {
    if (activeQueue.length > 0 && currentIndex >= activeQueue.length) {
      setCurrentIndex(activeQueue.length - 1);
    }
  }, [activeQueue.length, currentIndex]);

  const handleSliderChange = (id, value) => {
    const numericValue = parseInt(value, 10);

    setPreferences((prev) => {
      const updatedPreferences = { ...prev };
      if (numericValue === 0) {
        delete updatedPreferences[id];
      } else {
        updatedPreferences[id] = numericValue;
      }

      return updatedPreferences;
    });
  };

  const handleNext = () => {
    if (currentIndex < activeQueue.length - 1 && !animDir) {
      setAnimDir("next");
      // Wait for the card to fly off before updating index
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setAnimDir(null);
      }, 400);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !animDir) {
      setAnimDir("prev");
      // Update index immediately so the previous card mounts and runs the enter animation
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => {
        setAnimDir(null);
      }, 400);
    }
  };

  const submitPreferences = async () => {
    setIsSubmitting(true);
    try {
      await fetchApi("/api/onboarding/complete", {
        method: "POST",
        body: JSON.stringify({ preferences }),
      });
      setUser((prev) => ({ ...prev, onboardingDone: true }));
      navigate("/home");
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const visibleCards = activeQueue.slice(currentIndex, currentIndex + 3);
  const isFinished = currentIndex >= activeQueue.length - 1;
  const ratedCount = Object.keys(preferences).length;
  const maturityPercent = Math.min(100, Math.round((ratedCount / 8) * 100));
  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${user?.username || "Reader"}&background=a43700&color=fff&rounded=true`;

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col overflow-hidden relative">
      <style>{`
        @keyframes flyInLeft {
          0% { transform: translate(-120%, 20px) rotate(-20deg) scale(0.9); opacity: 0; }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
        }
        .animate-fly-in {
          animation: flyInLeft 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <header className="w-full z-50 flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
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
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              Profile Maturity
            </span>
            <span className="font-headline text-sm font-bold text-primary">
              {maturityPercent}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20 shadow-sm">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 max-w-7xl mx-auto w-full gap-12 lg:gap-24 py-12">
        <section className="w-full md:w-1/2 text-left">
          <span className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary mb-3 block">
            Personalization
          </span>
          <h2 className="font-headline text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-on-surface leading-tight mb-6">
            Define Your <br />
            <span className="italic text-primary">Literary Taste.</span>
          </h2>
          <p className="font-body text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed mb-8">
            Tell us what you love. Rate a category highly, and we'll shuffle
            specific sub-genres into your deck to pinpoint your exact algorithm.
          </p>

          <div className="inline-flex items-center gap-4">
            <div className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant bg-surface-container px-4 py-2 rounded-full">
              Card {currentIndex + 1} of {activeQueue.length}
            </div>
          </div>
        </section>

        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative w-full max-w-md h-[480px] md:h-[420px] perspective-1000">
            {visibleCards.map((card, idx) => {
              // Base stack math for a "messy" deck
              let yOffset = 0;
              let rotation = 0;
              let scale = 1;
              let opacity = 1;

              if (idx === 0) {
                // Top card logic
                if (animDir === "next") {
                  yOffset = 20;
                  rotation = -20;
                  scale = 0.9;
                  opacity = 0; // Fades and flies out
                }
              } else if (idx === 1) {
                // Second card logic
                yOffset = 24;
                rotation = -4; // Tilted slightly left
                scale = 0.95;
                opacity = 0.8;
                if (animDir === "next") {
                  // Moves up to become the top card
                  yOffset = 0;
                  rotation = 0;
                  scale = 1;
                  opacity = 1;
                }
              } else if (idx === 2) {
                // Third card logic
                yOffset = 48;
                rotation = 3; // Tilted slightly right
                scale = 0.9;
                opacity = 0.4;
                if (animDir === "next") {
                  // Moves up to become the second card
                  yOffset = 24;
                  rotation = -4;
                  scale = 0.95;
                  opacity = 0.8;
                }
              }

              // Apply the custom keyframe ONLY to the top card when undoing
              const isFlyingIn = idx === 0 && animDir === "prev";

              const meta = getGenreMeta(card.slug);

              return (
                <div
                  key={card.id}
                  className={`absolute top-0 left-0 w-full h-full p-8 rounded-[2rem] bg-surface-container-lowest flex flex-col origin-bottom ${
                    isFlyingIn
                      ? "animate-fly-in"
                      : "transition-all duration-[400ms] ease-out"
                  }`}
                  style={{
                    zIndex: 30 - idx,
                    pointerEvents: idx === 0 ? "auto" : "none",
                    transform: isFlyingIn
                      ? undefined
                      : `translate(${animDir === "next" && idx === 0 ? "-120%" : "0"}, ${yOffset}px) rotate(${rotation}deg) scale(${scale})`,
                    opacity: isFlyingIn ? undefined : opacity,
                    boxShadow:
                      idx === 0 && !animDir
                        ? "0 25px 50px -12px rgba(164, 55, 0, 0.15)"
                        : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    border:
                      idx === 0
                        ? "1px solid rgba(164, 55, 0, 0.2)"
                        : "1px solid var(--color-outline-variant)",
                  }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="material-symbols-outlined text-4xl mb-4 block text-primary drop-shadow-sm">
                        {meta.icon}
                      </span>
                      <h3 className="font-headline text-3xl font-bold leading-tight">
                        {card.name}
                      </h3>
                    </div>
                    <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded whitespace-nowrap">
                      {meta.label}
                    </span>
                  </div>

                  <p className="text-base text-on-surface-variant/80 mb-6 leading-relaxed flex-grow">
                    {card.description}
                  </p>

                  <div className="space-y-4 mt-auto pt-6 border-t border-outline-variant/10">
                    <div className="flex justify-between items-center font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                      <span>Interest</span>
                      <span className="text-primary text-lg">
                        {preferences[card.id] || 0} / 5
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={preferences[card.id] || 0}
                      onChange={(e) =>
                        handleSliderChange(card.id, e.target.value)
                      }
                      className="w-full h-2 bg-surface-container-highest rounded-full appearance-none outline-none"
                      style={{
                        accentColor: "var(--color-primary)",
                        cursor: "pointer",
                      }}
                    />
                    <div className="flex justify-between text-xs text-on-surface-variant/60 font-medium">
                      <span>Not for me</span>
                      <span>Love it</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 flex items-center justify-center gap-4 w-full max-w-md">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || animDir !== null}
              className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">undo</span>
            </button>

            {isFinished ? (
              <button
                onClick={submitPreferences}
                disabled={isSubmitting || ratedCount === 0 || animDir !== null}
                className="flex-1 h-14 rounded-full bg-primary text-on-primary font-label text-sm font-extrabold uppercase tracking-[0.2em] shadow-[0_8px_24px_rgba(164,55,0,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? "Saving..." : "Finish Profile"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={animDir !== null}
                className="flex-1 h-14 rounded-full bg-surface-container-highest text-on-surface font-label text-sm font-extrabold uppercase tracking-[0.2em] hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                {(preferences[visibleCards[0]?.id] || 0) > 0
                  ? "Next Card"
                  : "Skip Card"}
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
