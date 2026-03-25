// src/components/ScanHistoryCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ScanHistoryCard({ scan }) {
  const navigate = useNavigate();

  // Sort to ensure the best matches are on top of the stack
  const books = [...(scan.books || [])].sort(
    (a, b) => (a.recommendationRank || 99) - (b.recommendationRank || 99),
  );

  // Take up to 3 books for the stacked visual
  const topBooks = books.slice(0, 3);
  const topBook = topBooks[0];

  // Format the time (fallback to now if backend hasn't implemented createdAt yet)
  const scanDate = new Date(scan.scannedAt || Date.now());
  const timeString = scanDate.toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      onClick={() => navigate(`/scan/${scan.scanId}`)}
      className="group bg-surface-container-lowest rounded-[1.5rem] p-5 flex flex-col md:flex-row gap-6 border border-outline-variant/10 shadow-[0_4px_16px_rgba(27,28,26,0.03)] hover:shadow-[0_8px_24px_rgba(27,28,26,0.06)] transition-all cursor-pointer"
    >
      {/* Stacked Covers Visual */}
      <div className="relative w-28 h-36 shrink-0 ml-2 mt-2">
        {topBooks.length > 0 ? (
          topBooks.map((b, i) => (
            <div
              key={b.bookId || b.id || i}
              className="absolute rounded-sm shadow-md overflow-hidden bg-surface-container flex items-center justify-center transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg"
              style={{
                top: `${i * 12}px`,
                left: `${i * 12}px`,
                width: "5.5rem",
                height: "8rem",
                zIndex: 30 - i,
                opacity: 1 - i * 0.15,
              }}
            >
              {b.coverUrl ? (
                <img
                  src={b.coverUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
                  menu_book
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="absolute top-0 left-0 w-[5.5rem] h-[8rem] rounded-sm shadow-md bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
              broken_image
            </span>
          </div>
        )}
      </div>

      {/* Scan Details */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-2">
          <span className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
            {scan.totalExtracted || 0} Titles Extracted
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50">
            {timeString}
          </span>
        </div>

        <h3 className="font-headline text-xl font-bold text-on-surface leading-tight mb-2">
          {topBook ? `Top Match: ${topBook.title}` : "Library Scan"}
        </h3>

        <p className="font-body text-sm text-on-surface-variant mb-4">
          We found{" "}
          <span className="font-bold text-primary">
            {scan.totalMatched || 0} matches
          </span>{" "}
          across your existing library and new recommendations based on this
          shelf.
        </p>

        <div className="mt-auto flex items-center gap-2 text-tertiary font-label text-[10px] uppercase tracking-widest font-bold group-hover:translate-x-1 transition-transform">
          <span>View Full Analysis</span>
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </div>
      </div>
    </div>
  );
}
