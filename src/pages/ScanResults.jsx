// src/pages/ScanResults.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchApi } from "../utils/api";
import ScanResultCard from "../components/ScanResultCard"; // Import the new modular component

export default function ScanResults() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scanData, setScanData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=a43700&color=fff&rounded=true`;

  useEffect(() => {
    const fetchScanDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch the past scan [cite: 6, 167-169]
        const data = await fetchApi(`/api/scans/${scanId}`);

        // Normalize the data
        const booksArray = data.recommendations || data.books || [];

        // Sort by recommendation rank to ensure Highly Recommended is first
        booksArray.sort(
          (a, b) => (a.recommendationRank || 99) - (b.recommendationRank || 99),
        );

        setScanData({ ...data, books: booksArray });
      } catch (err) {
        console.error("Failed to fetch scan results:", err);
        setError(
          "Could not load scan results. The scan may have been deleted or expired.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (scanId) fetchScanDetails();
  }, [scanId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface pb-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant animate-pulse">
            Curating your results...
          </p>
        </div>
      </div>
    );
  }

  if (error || !scanData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-6 text-center pb-24">
        <span className="material-symbols-outlined text-error text-5xl mb-4">
          error
        </span>
        <h2 className="font-headline text-3xl font-bold mb-2">
          Something went wrong
        </h2>
        <p className="font-body text-on-surface-variant mb-8">{error}</p>
        <button
          onClick={() => navigate("/home")}
          className="px-6 py-3 bg-surface-container rounded-xl font-label text-sm font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopAppBar with Back Button */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors mr-1"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            menu_book
          </span>
          <h1 className="font-headline text-2xl font-semibold italic text-primary">
            FindMyReads
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant/20 shadow-sm mr-2">
          <img
            src={avatarUrl}
            alt="User Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Header Section */}
        <section className="mb-10 animate-fade-in-up">
          <span className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary mb-2 block">
            Analysis Complete
          </span>
          <h2 className="font-headline text-4xl font-medium leading-tight mb-4">
            Your Curated Results
          </h2>
          <p className="font-body text-on-surface-variant text-md leading-relaxed">
            Based on your scanned library and reading history, we've identified{" "}
            <span className="text-primary font-bold italic font-headline">
              definitive matches
            </span>{" "}
            for your next journey.
          </p>
        </section>

        {/* Modular Results List */}
        <div className="space-y-12">
          {scanData.books.map((book, index) => (
            <ScanResultCard
              key={book.bookId || book.id}
              initialBook={book}
              index={index}
              scanId={scanId}
            />
          ))}
        </div>

        {/* Pagination / Load More */}
        <div className="mt-16 text-center pb-10">
          <button className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary hover:underline py-4 transition-all hover:text-primary">
            View More Results (
            {Math.max(0, (scanData.totalMatched || 0) - scanData.books.length)})
          </button>
        </div>
      </main>
    </div>
  );
}
