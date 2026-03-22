// src/components/LibraryBookCard.jsx
import React, { useState } from "react";
import { fetchApi } from "../utils/api";

export default function LibraryBookCard({ userBook, onUpdate }) {
  const book = userBook.book;
  const bookId = book.id || book.bookId;

  const [rating, setRating] = useState(userBook.rating || 0);
  const [isRating, setIsRating] = useState(false);

  // Formatting Book Data
  const title = book.title || "Unknown Title";
  const author = book.author || "Unknown Author";
  const coverUrl = book.coverUrl;
  const displayGenre = book.genres?.[0] || "Uncategorized";
  const publishedYear = book.publishedAt
    ? new Date(book.publishedAt).getFullYear()
    : "N/A";

  // Handle Interactive Star Rating [cite: 114-118]
  const handleRate = async (newRating) => {
    if (rating === newRating) return; // Prevent redundant API calls

    setRating(newRating);
    setIsRating(true);

    try {
      await fetchApi(`/api/me/books/${bookId}/rate`, {
        method: "PATCH",
        body: JSON.stringify({ rating: newRating }),
      });
      // Optionally trigger a refresh in the parent component
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Failed to save rating.");
      setRating(userBook.rating || 0); // Revert on failure
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] p-5 flex flex-col md:flex-row gap-5 border border-outline-variant/10 shadow-[0_4px_16px_rgba(27,28,26,0.03)] hover:shadow-[0_8px_24px_rgba(27,28,26,0.06)] transition-all">
      {/* Cover Art */}
      <div className="w-24 md:w-28 shrink-0">
        <div className="w-full aspect-[2/3] bg-surface-container flex items-center justify-center rounded-sm shadow-sm overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Cover of ${title}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
              menu_book
            </span>
          )}
        </div>
      </div>

      {/* Content Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <span className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">
              {displayGenre}
            </span>
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/40 font-bold">
              {userBook.status === "read" ? "Read" : "Want to Read"}
            </span>
          </div>

          <h3 className="font-headline text-xl font-semibold mb-1 text-on-surface line-clamp-2 leading-tight">
            {title}
          </h3>
          <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider mb-3">
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
        </div>

        {/* Interactive Star Rating */}
        <div className="mt-auto pt-3 border-t border-outline-variant/10 flex items-center justify-between">
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
                      ? "text-primary" // Filled/Colored
                      : "text-on-surface-variant/20 hover:text-primary/50" // Grey initially, light primary on hover
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
