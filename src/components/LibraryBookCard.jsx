// src/components/LibraryBookCard.jsx
import React, { useState } from "react";
import { fetchApi } from "../utils/api";

export default function LibraryBookCard({ userBook, onUpdate }) {
  const book = userBook.book;
  const bookId = book.id || book.bookId;

  const [rating, setRating] = useState(userBook.rating || 0);
  const [isRating, setIsRating] = useState(false);

  // State for the description accordion
  const [showDescription, setShowDescription] = useState(false);

  // Formatting Book Data
  const title = book.title || "Unknown Title";
  const author = book.author || "Unknown Author";
  const coverUrl = book.coverUrl;

  // Extract ALL genres, fallback if empty
  const genres =
    book.genres && book.genres.length > 0 ? book.genres : ["Uncategorized"];

  const publishedYear = book.publishedAt
    ? new Date(book.publishedAt).getFullYear()
    : "N/A";

  // Handle Interactive Star Rating
  const handleRate = async (newRating) => {
    if (rating === newRating) return;

    setRating(newRating);
    setIsRating(true);

    try {
      await fetchApi(`/api/me/books/${bookId}/rate`, {
        method: "PATCH",
        body: JSON.stringify({ rating: newRating }),
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Failed to save rating.");
      setRating(userBook.rating || 0);
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 flex flex-col md:flex-row gap-6 border border-outline-variant/10 shadow-[0_4px_16px_rgba(27,28,26,0.03)] hover:shadow-[0_8px_24px_rgba(27,28,26,0.06)] transition-all">
      {/* Cover Art - Matched to ScanResultCard sizes */}
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
          <div className="flex justify-between items-start mb-3 gap-4">
            <div className="flex flex-wrap gap-2">
              {genres.map((genre, idx) => (
                <span
                  key={idx}
                  className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Reading Status Tag */}
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/50 font-bold whitespace-nowrap mt-1">
              {userBook.status === "read" ? "Read" : "To be Read"}
            </span>
          </div>

          <h3 className="font-headline text-2xl font-semibold mb-1 text-on-surface leading-tight">
            {title}
          </h3>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-wide mb-4">
            By {author}
          </p>

          {/* Rich Metadata Section */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex flex-col">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
                Published
              </span>
              <span className="font-body text-xs text-on-surface-variant font-medium">
                {publishedYear}
              </span>
            </div>
            {book.pageCount && (
              <div className="flex flex-col">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
                  Length
                </span>
                <span className="font-body text-xs text-on-surface-variant font-medium">
                  {book.pageCount} pages
                </span>
              </div>
            )}
          </div>

          {/* Description Toggle Accordion */}
          <div className="mb-6">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant hover:text-primary transition-colors"
            >
              Show Description
              <span
                className={`material-symbols-outlined text-base transition-transform duration-300 ${showDescription ? "rotate-180" : ""}`}
              >
                expand_more
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${showDescription ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="bg-surface-container-low rounded-lg p-4 text-sm font-body border-l-2 border-outline-variant/30 text-on-surface-variant/90 leading-relaxed">
                  {book.description ||
                    "No description available for this title."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Star Rating */}
        <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center justify-between">
          <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60">
            {isRating ? "Saving..." : "Your Rating"}
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                disabled={isRating}
                className="group p-1 transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
              >
                <span
                  className={`material-symbols-outlined text-xl transition-colors ${
                    star <= rating
                      ? "text-primary"
                      : "text-on-surface-variant/20 hover:text-primary/50"
                  }`}
                  style={{
                    fontVariationSettings:
                      star <= rating ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  star
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
