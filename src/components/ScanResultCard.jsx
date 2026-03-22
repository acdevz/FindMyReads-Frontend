import React, { useState, useEffect } from "react";
import { fetchApi } from "../utils/api";

export default function ScanResultCard({ initialBook, index, scanId }) {
  const bookId = initialBook.bookId || initialBook.id;

  // Data States
  const [bookDetails, setBookDetails] = useState(initialBook);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Interaction States
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(null);

  // LLM Reason States
  const [reason, setReason] = useState(null);
  const [isFetchingReason, setIsFetchingReason] = useState(false);
  const [showReason, setShowReason] = useState(false);

  // Visual Tiers based on Index
  const isHighlyRecommended = index === 0;
  const isRecommended = index === 1;
  const isNotRecommended = index >= 2;

  // Fetch full book details on mount
  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        const fullData = await fetchApi(`/api/books/${bookId}`);
        setBookDetails((prev) => ({ ...prev, ...fullData }));
      } catch (error) {
        console.error("Failed to fetch full book details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchFullDetails();
  }, [bookId]);

  // Handle Save to Library [cite: 106-113]
  const handleSaveToLibrary = async () => {
    setIsSaving(true);
    try {
      await fetchApi("/api/me/books", {
        method: "POST",
        body: JSON.stringify({
          bookId: bookId,
          status: "want_to_read",
          source: "scan",
        }),
      });
      setIsSaved(true);
    } catch (err) {
      alert(err.message || "Failed to save book.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Rating (No stars, purely numerical)
  const handleRate = async (rateValue) => {
    setUserRating(rateValue);
    try {
      // API expects a PATCH for existing library books
      await fetchApi(`/api/me/books/${bookId}/rate`, {
        method: "PATCH",
        body: JSON.stringify({ rating: rateValue }),
      });
      setIsSaved(true); // Implies it's in the library now
    } catch (err) {
      // If it fails (e.g., not in library yet), POST it with the rating [cite: 106-110]
      try {
        await fetchApi("/api/me/books", {
          method: "POST",
          body: JSON.stringify({
            bookId: bookId,
            status: "read",
            source: "scan",
            rating: rateValue,
          }),
        });
        setIsSaved(true);
      } catch (e) {
        alert("Failed to save rating.");
        setUserRating(null); // revert UI on failure
      }
    }
  };

  // Handle On-Demand LLM Explanation
  const toggleReason = async () => {
    if (showReason) {
      setShowReason(false);
      return;
    }

    setShowReason(true);
    if (!reason) {
      setIsFetchingReason(true);
      try {
        const data = await fetchApi(`/api/scans/${scanId}/books/${bookId}/why`);
        setReason(data.reason);
      } catch (err) {
        setReason(
          "We matched this against the thematic patterns extracted from your shelf.",
        );
      } finally {
        setIsFetchingReason(false);
      }
    }
  };

  // Dynamic Styling Rules
  let cardClasses =
    "bg-surface-container-lowest rounded-[1.5rem] p-6 flex flex-col md:flex-row gap-6 border border-outline-variant/10 shadow-[0_12px_32px_rgba(27,28,26,0.04)] transition-all";
  let tagColor = "bg-tertiary/10 text-tertiary";
  let tagText = "Highly Recommended";
  let ribbonColor = "bg-tertiary";
  let highlightColor = "text-tertiary border-tertiary/30";
  let reasonHeading = "Why you'll like it";

  if (isRecommended) {
    tagColor = "bg-secondary/10 text-secondary";
    tagText = "Recommended";
    ribbonColor = "bg-secondary";
    highlightColor = "text-secondary border-secondary/30";
  } else if (isNotRecommended) {
    // Grayed out but still fully functional
    cardClasses =
      "bg-surface-container rounded-[1.5rem] p-6 flex flex-col md:flex-row gap-6 border border-outline-variant/10 opacity-80 grayscale-[0.2] hover:grayscale-0 transition-all";
    tagColor = "bg-on-surface-variant/10 text-on-surface-variant";
    tagText = "Not Recommended";
    ribbonColor = "bg-on-surface-variant/40";
    highlightColor = "text-on-surface-variant border-on-surface-variant/20";
    reasonHeading = "Prediction Insight";
  }

  // Formatting Book Data
  const title = bookDetails.title || "Loading...";
  const author = bookDetails.author || "...";
  const coverUrl = bookDetails.coverUrl;
  const displayGenre = bookDetails.genres?.[0] || "Unknown Genre";
  const publishedYear = bookDetails.publishedAt
    ? new Date(bookDetails.publishedAt).getFullYear()
    : "N/A";

  return (
    <div
      className="relative group animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Progress Bookmark Indicator (Only for top match) */}
      {isHighlyRecommended && (
        <div
          className={`absolute -left-4 top-0 w-1.5 h-16 ${ribbonColor} rounded-full`}
        ></div>
      )}

      <div className={cardClasses}>
        {/* Cover Art */}
        <div className="w-full md:w-32 shrink-0">
          <div className="w-full aspect-[2/3] bg-surface-container flex items-center justify-center rounded-sm shadow-sm overflow-hidden">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`Cover of ${title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">
                menu_book
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span
                className={`px-3 py-1 font-label text-[10px] uppercase tracking-wider font-bold rounded-full ${tagColor}`}
              >
                {tagText}
              </span>

              {/* Numeric Match Score instead of Stars */}
              <span className="font-label text-xs font-bold text-on-surface-variant/60">
                {Math.round((initialBook.matchScore || 0) * 100)}% Match
              </span>
            </div>

            <h3
              className={`font-headline text-2xl font-semibold mb-1 ${isNotRecommended ? "text-on-surface-variant" : "text-on-surface"}`}
            >
              {title}
            </h3>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-wide mb-4">
              By {author}
            </p>

            {/* Rich Metadata Section */}
            {!isLoadingDetails && (
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex flex-col">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
                    Genre
                  </span>
                  <span className="font-body text-xs text-on-surface-variant font-medium">
                    {displayGenre}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
                    Published
                  </span>
                  <span className="font-body text-xs text-on-surface-variant font-medium">
                    {publishedYear}
                  </span>
                </div>
                {bookDetails.pageCount && (
                  <div className="flex flex-col">
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
                      Length
                    </span>
                    <span className="font-body text-xs text-on-surface-variant font-medium">
                      {bookDetails.pageCount} pages
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* On-Demand LLM Explanation Dropdown  */}
            <div className="mb-6">
              <button
                onClick={toggleReason}
                className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant hover:text-primary transition-colors"
              >
                {reasonHeading}
                <span
                  className={`material-symbols-outlined text-base transition-transform duration-300 ${showReason ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${showReason ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`bg-surface-container-low rounded-lg p-3 italic text-sm font-body border-l-2 ${highlightColor}`}
                  >
                    {isFetchingReason ? (
                      <span className="flex items-center gap-2 text-on-surface-variant/70">
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        Consulting your library patterns...
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/90">
                        {reason}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row: Save & Discrete Rating (No Stars) */}
          <div className="flex flex-wrap items-center gap-4 mt-auto pt-4 border-t border-outline-variant/10">
            <button
              onClick={handleSaveToLibrary}
              disabled={isSaving || isSaved}
              className={`flex-1 py-3 px-4 rounded-xl font-label text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                isSaved
                  ? "bg-surface-container text-primary border border-primary/20"
                  : "bg-on-surface text-surface hover:bg-on-surface/90 shadow-md"
              }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>
              ) : isSaved ? (
                <>
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bookmark_added
                  </span>{" "}
                  Saved
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    library_add
                  </span>{" "}
                  Add to Library
                </>
              )}
            </button>

            {/* {/* Numerical Rating Component (No Stars)
            <div className="flex items-center gap-2 bg-surface-container rounded-xl p-1">
              <span className="font-label text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/60 ml-2">
                Rate:
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleRate(num)}
                    className={`w-8 h-8 rounded-lg font-label text-xs font-bold transition-all ${
                      userRating === num
                        ? "bg-primary text-on-primary shadow-md"
                        : "text-on-surface-variant hover:bg-surface-container-highest"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            */}
          </div>
        </div>
      </div>
    </div>
  );
}
