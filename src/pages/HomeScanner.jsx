// src/pages/HomeScanner.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchApi } from "../utils/api";
import BookCard from "../components/BookCard";
import ScanHistoryCard from "../components/ScanHistoryCard"; // <-- Import the new card
import CameraOverlay from "../components/CameraOverlay";

// Helper function to group scans by Date
const groupScansByDate = (scans) => {
  const groups = {};
  const todayStr = new Date().toLocaleDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString();

  scans.forEach((scan) => {
    const dateObj = new Date(scan.createdAt || Date.now());
    const dateStr = dateObj.toLocaleDateString();

    let label = dateObj.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (dateStr === todayStr) label = "Today";
    else if (dateStr === yesterdayStr) label = "Yesterday";

    if (!groups[label]) groups[label] = [];
    groups[label].push(scan);
  });
  return groups;
};

export default function HomeScanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("scans");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Data States
  const [scans, setScans] = useState([]);
  const [readBooks, setReadBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=a43700&color=fff&rounded=true`;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "scans") {
          const data = await fetchApi("/api/scans");
          // Sort scans so newest are first
          const sortedScans = (data || []).sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
          );
          setScans(sortedScans);
        } else if (activeTab === "books" && readBooks.length === 0) {
          const data = await fetchApi("/api/me/books?status=read");
          setReadBooks(data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [activeTab, readBooks.length]);

  const processImage = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const scanResult = await fetchApi("/api/scans", {
        method: "POST",
        body: formData,
      });
      navigate(`/scan/${scanResult.scanId}`);
    } catch (error) {
      console.error("Scan upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoCapture = (file) => {
    setIsCameraOpen(false);
    processImage(file);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImage(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Apply grouping to scans
  const groupedScans = groupScansByDate(scans);

  return (
    <>
      <style>
        {`
          .scanner-frame {
              background: linear-gradient(to bottom, transparent 49.5%, var(--color-primary) 50%, var(--color-primary) 50.5%, transparent 51%);
              background-size: 100% 200%;
              animation: scan 3s linear infinite;
          }
          @keyframes scan {
              0% { background-position: 0% 100%; }
              100% { background-position: 0% 0%; }
          }
        `}
      </style>

      {isCameraOpen && (
        <CameraOverlay
          onClose={() => setIsCameraOpen(false)}
          onCapture={handlePhotoCapture}
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
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
        <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant/20 shadow-sm">
          <img
            src={avatarUrl}
            alt="User profile avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <main className="pt-20">
        {/* Scanner Hero */}
        <section className="relative w-full h-[397px] bg-on-surface overflow-hidden flex flex-col items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop"
            alt="Library bookshelf background"
            className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale-[0.5]"
          />

          <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="relative w-56 h-56 border-2 border-primary/40 rounded-xl overflow-hidden shadow-[0_0_0_100vmax_rgba(27,28,26,0.5)] m-1">
              <div className="scanner-frame absolute inset-0 opacity-40"></div>
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-sm"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-sm"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-sm"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-sm"></div>
            </div>
          </div>

          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 w-max">
            <button
              onClick={() => setIsCameraOpen(true)}
              disabled={isUploading}
              className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-[1.5rem] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-80 disabled:hover:scale-100"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined">
                  center_focus_strong
                </span>
              )}
              <span className="font-label font-bold tracking-[0.2em] uppercase text-sm">
                {isUploading ? "Analyzing..." : "Scan Shelf"}
              </span>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-14 h-14 bg-surface-bright/90 backdrop-blur-md text-primary rounded-full shadow-lg hover:bg-surface border border-outline-variant/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-80 disabled:hover:scale-100"
            >
              <span className="material-symbols-outlined">photo_library</span>
            </button>
          </div>
        </section>

        {/* Content Section */}
        <section className="mt-[-2rem] relative z-20 bg-surface rounded-t-[2.5rem] px-6 pt-12 min-h-[50vh]">
          {/* Tabs */}
          <div className="flex items-center gap-8 mb-12 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("scans")}
              className="flex flex-col items-start group"
            >
              <span
                className={`font-headline text-2xl transition-colors ${activeTab === "scans" ? "font-bold text-on-surface" : "font-semibold text-on-surface/40 group-hover:text-on-surface"}`}
              >
                Previous Scans
              </span>
              <div
                className={`h-1 bg-primary mt-1 rounded-full transition-all duration-300 ${activeTab === "scans" ? "w-8" : "w-0 group-hover:w-4"}`}
              ></div>
            </button>
            {/* <button
              onClick={() => setActiveTab("books")}
              className="flex flex-col items-start group"
            >
              <span
                className={`font-headline text-2xl transition-colors ${activeTab === "books" ? "font-bold text-on-surface" : "font-semibold text-on-surface/40 group-hover:text-on-surface"}`}
              >
                Read Books
              </span>
              <div
                className={`h-1 bg-primary mt-1 rounded-full transition-all duration-300 ${activeTab === "books" ? "w-8" : "w-0 group-hover:w-4"}`}
              ></div>
            </button>*/}
          </div>

          {/* Dynamic Content Area */}
          <div className="pb-8">
            {isLoading && (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Read Books Rendering */}
            {!isLoading &&
              activeTab === "books" &&
              (readBooks.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant font-headline italic text-xl">
                  Your library is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {readBooks.map((userBook, index) => (
                    <BookCard
                      key={userBook.userBookId}
                      type="read"
                      data={userBook}
                      index={index}
                    />
                  ))}
                </div>
              ))}

            {/* Grouped Scans Rendering */}
            {!isLoading &&
              activeTab === "scans" &&
              (scans.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant font-headline italic text-xl">
                  You haven't scanned any shelves yet.
                </div>
              ) : (
                Object.keys(groupedScans).map((dateLabel) => (
                  <div key={dateLabel} className="mb-10 animate-fade-in-up">
                    <h3 className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant/60 mb-4 ml-1">
                      {dateLabel}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {groupedScans[dateLabel].map((scan) => (
                        <ScanHistoryCard key={scan.scanId} scan={scan} />
                      ))}
                    </div>
                  </div>
                ))
              ))}
          </div>
        </section>
      </main>
    </>
  );
}
