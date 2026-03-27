// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchApi } from "../utils/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function Profile() {
  // Grab setUser from your AuthContext so we can update the global state
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [deviation, setDeviation] = useState(user?.deviationAlpha ?? 0.2);
  const [isSavingDeviation, setIsSavingDeviation] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [genreScores, setGenreScores] = useState([]);
  const [isLoadingScores, setIsLoadingScores] = useState(true);

  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${user?.username || "Reader"}&background=a43700&color=fff&rounded=true&size=256`;

  useEffect(() => {
    const fetchFreshUserData = async () => {
      try {
        const freshUser = await fetchApi("/api/me");
        // Sync with global state so stats update instantly
        if (setUser) setUser((prev) => ({ ...prev, ...freshUser }));
        // Sync the local slider with the DB's true value
        if (freshUser?.deviationAlpha !== undefined) {
          setDeviation(freshUser.deviationAlpha);
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    };
    fetchFreshUserData();
  }, [setUser]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const data = await fetchApi("/api/me/data/genre_scores");

        const normalizedData = data.map((d) => {
          const rawScore = parseFloat(d.score);
          const clampedScore = Math.max(-1, Math.min(1, rawScore));
          const base0to1 = (clampedScore + 1) / 2;

          const sharpnessPower = 3;
          let normalizedScore = Math.pow(base0to1, sharpnessPower) * 100;
          normalizedScore = Math.max(5, normalizedScore);

          return {
            subject: d.genre,
            fullMark: 100,
            rawScore: rawScore.toFixed(2),
            score: normalizedScore,
          };
        });

        setGenreScores(normalizedData);
      } catch (error) {
        console.error("Failed to load genre scores:", error);
      } finally {
        setIsLoadingScores(false);
      }
    };
    fetchScores();
  }, []);

  const handleDeviationChange = async (e) => {
    setDeviation(parseFloat(e.target.value));
  };

  const saveDeviation = async () => {
    setIsSavingDeviation(true);
    setSaveMessage("");
    try {
      await fetchApi("/api/me/deviation", {
        method: "PATCH",
        body: JSON.stringify({ alpha: deviation }),
      });

      if (setUser) setUser((prev) => ({ ...prev, deviationAlpha: deviation }));

      setSaveMessage("Algorithm updated.");
      setTimeout(() => setSaveMessage(""), 3000);
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

  const getDeviationDescription = () => {
    if (deviation < 0.3)
      return "Strict & Safe. Sticks closely to your established shelf.";
    if (deviation < 0.7)
      return "Balanced. Introduces gentle variations of your favorite themes.";
    return "Adventurous. High chance of discovering wildly different wildcard genres.";
  };

  // Custom Tooltip for the Recharts Radar
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-container-highest/90 backdrop-blur-md border border-outline-variant/20 p-3 rounded-lg shadow-xl">
          <p className="font-label text-xs uppercase tracking-widest font-bold text-primary mb-1">
            {data.subject}
          </p>
          <p className="font-body text-sm text-on-surface">
            Similarity: <span className="font-bold">{data.rawScore}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-center items-center px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <h1 className="font-headline text-2xl font-semibold italic text-primary">
          Your Passport
        </h1>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-12">
        {/* User Identity Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center text-center mt-4">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-surface-container overflow-hidden border-4 border-surface shadow-xl z-10 relative">
              <img
                src={avatarUrl}
                alt="User profile avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border border-primary/20 rounded-full -z-0"></div>
          </div>

          <h2 className="font-headline text-4xl font-bold mb-1">
            {user?.username || "Avid Reader"}
          </h2>
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">
            {user?.email || "reader@findmyreads.com"}
          </p>

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

        {/* --- RECHARTS SPIDER CHART SECTION --- */}
        <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] p-4 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-75 fill-mode-both">
          <style>{`
                    .recharts-wrapper,
                    .recharts-surface,
                    .recharts-polar-angle-axis-tick {
                      outline: none !important;
                    }
                  `}</style>

          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-headline text-2xl font-semibold mb-1">
                Literary Taste
              </h3>
              <p className="font-body text-sm text-on-surface-variant max-w-sm leading-relaxed">
                Your unique reading footprint, shaped by every book you rate and
                discover.
              </p>
            </div>
          </div>

          {/* Changed pointer-events-none to prevent any click registration at all */}
          <div className="w-full h-[400px] md:h-[500px] pointer-events-none">
            {isLoadingScores ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : genreScores.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-label text-sm uppercase tracking-widest">
                No data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={genreScores}
                >
                  <PolarGrid
                    stroke="var(--color-outline-variant)"
                    strokeOpacity={0.4}
                  />

                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: "var(--color-on-surface-variant)",
                      fontSize: 12,
                      fontWeight: 400,
                      width: 100,
                      textAnchor: "middle",
                    }}
                  />

                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />

                  <Radar
                    name="Taste Profile"
                    dataKey="score"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="var(--color-primary)"
                    fillOpacity={0.3}
                    activeDot={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Algorithm Control (The Deviation Knob) */}
        <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-150 fill-mode-both">
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
              style={{ accentColor: "var(--color-primary)" }}
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
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 delay-200 fill-mode-both">
          <button
            onClick={() => navigate("/onboarding/genres")}
            className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30 transition-all group"
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

          {/* UPGRADED SIGN OUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/10 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-4 text-on-surface-variant group-hover:text-on-error transition-colors duration-300">
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
