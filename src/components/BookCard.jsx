import React from "react";

export default function BookCard({ type, data, index }) {
  // --- Data Normalization ---
  // If type === 'scan', data is a ScanHistoryResult. We extract the top book.
  // If type === 'read', data is a UserBook. We extract the book and rating.

  const isScan = type === "scan";

  // For scans, we display the first (top ranked) book in the array
  const book = isScan ? data.books?.[0] : data.book;
  if (!book) return null;

  const title = book.title || "Unknown Title";
  const author = book.author || "Unknown Author";
  const coverUrl = book.coverUrl;
  const genre = book.genres?.[0] || (isScan ? "Discovered" : "Archived");

  // Scan specific
  const matchScore = isScan ? Math.round((book.matchScore || 0) * 100) : null;

  // Read specific
  const rating = !isScan ? data.rating : null;

  // Visual variants based on index to match design asymmetry
  const isVariation = index % 3 === 2; // Every 3rd card gets a different background
  const ribbonClass =
    index % 3 === 0 ? "h-8" : index % 3 === 1 ? "h-6 opacity-40" : "hidden";

  return (
    <div
      className={`flex gap-4 p-4 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow ${isVariation ? "bg-surface-container-low" : "bg-surface-container-lowest"}`}
    >
      {/* Cover Image */}
      <div className="relative w-24 h-36 shrink-0 shadow-lg bg-surface-container flex items-center justify-center overflow-hidden rounded-sm">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Cover of ${title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-on-surface/30 text-4xl">
            menu_book
          </span>
        )}

        {/* Tertiary Ribbon for visual flair (Scans only) */}
        {isScan && (
          <div
            className={`absolute -top-1 right-2 w-3 bg-tertiary rounded-b-sm ${ribbonClass}`}
          ></div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col justify-between py-1 flex-1">
        <div>
          <span className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface/50 font-extrabold mb-1 block">
            {genre}
          </span>
          <h3 className="font-headline text-xl font-bold leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="font-body text-sm text-on-surface/70 mt-1 italic line-clamp-1">
            {author}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {isScan ? (
            <>
              <span className="bg-primary/10 text-primary text-[11px] font-bold px-2 py-1 rounded-md">
                Matches {matchScore}%
              </span>
              {/* Optional: Add a real timestamp formatter here if API provides it */}
              <span className="text-on-surface/30 text-[10px] uppercase font-bold tracking-widest">
                Recent
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1 text-primary">
              {/* Render rating out of 5 [cite: 110, 117] */}
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-sm"
                  style={{
                    fontVariationSettings:
                      i < (rating || 0) ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  star
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
