// src/pages/Library.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchApi } from "../utils/api";
import LibraryBookCard from "../components/LibraryBookCard";

export default function Library() {
  const { user } = useAuth();

  // States
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState("want_to_read"); // 'want_to_read' | 'read' | 'all'
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("recent"); // 'recent' | 'title'

  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${user?.username || "Reader"}&background=a43700&color=fff&rounded=true`;

  // Fetch library data whenever the filter changes
  const fetchLibrary = async () => {
    setIsLoading(true);
    try {
      let endpoint = "/api/me/books";
      if (filterStatus !== "all") {
        endpoint += `?status=${filterStatus}`;
      }
      const data = await fetchApi(endpoint);
      setLibraryBooks(data);
    } catch (error) {
      console.error("Failed to fetch library:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [filterStatus]);

  // Derived State: Apply local search filtering & sorting
  const processedBooks = libraryBooks
    .filter((ub) => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        ub.book.title?.toLowerCase().includes(lowerQuery) ||
        ub.book.author?.toLowerCase().includes(lowerQuery)
      );
    })
    .sort((a, b) => {
      if (sortOption === "title") {
        return (a.book.title || "").localeCompare(b.book.title || "");
      }
      // Default to recent
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    console.log(
      `Triggering global search for: ${searchQuery} via /api/books/search?q=${searchQuery}`,
    );
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            library_books
          </span>
          <h1 className="font-headline text-2xl font-semibold italic text-primary">
            Your Archive
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

      {/* CHANGED: max-w-4xl to max-w-2xl to perfectly match ScanResults width */}
      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Header & Search Area */}
        <section className="mb-10 animate-fade-in-up">
          <h2 className="font-headline text-4xl md:text-5xl font-medium leading-tight mb-6">
            The Library
          </h2>

          {/* Search Bar */}
          <form onSubmit={handleGlobalSearch} className="relative mb-8">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50">
              search
            </span>
            <input
              type="text"
              placeholder="Search your library or discover new books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-outline-variant/50 py-3 pl-8 pr-4 font-body text-on-surface focus:ring-0 focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/40"
            />
          </form>

          {/* Filters & Sorting Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-outline-variant/10 pb-2">
              {[
                { id: "want_to_read", label: "Unread" },
                { id: "read", label: "Completed" },
                { id: "all", label: "Everything" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className="flex flex-col items-start group whitespace-nowrap"
                >
                  <span
                    className={`font-headline text-xl transition-colors ${filterStatus === tab.id ? "font-bold text-on-surface" : "font-semibold text-on-surface-variant/60 group-hover:text-on-surface"}`}
                  >
                    {tab.label}
                  </span>
                  <div
                    className={`h-1 bg-primary mt-1 rounded-full transition-all duration-300 ${filterStatus === tab.id ? "w-8" : "w-0 group-hover:w-4"}`}
                  ></div>
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                sort
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent border-none font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant focus:ring-0 cursor-pointer"
              >
                <option value="recent">Recently Added</option>
                <option value="title">By Title</option>
              </select>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant animate-pulse">
                Dusting the shelves...
              </p>
            </div>
          ) : processedBooks.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4">
                menu_book
              </span>
              <h3 className="font-headline text-2xl text-on-surface-variant italic mb-2">
                No books found.
              </h3>
              <p className="font-body text-sm text-on-surface-variant/60 max-w-sm">
                {searchQuery
                  ? "Try adjusting your search terms or hit enter to search globally."
                  : "Scan a bookshelf from the Home tab to start building your collection."}
              </p>
            </div>
          ) : (
            // CHANGED: Replaced the 2-column grid with a single column stack (space-y-12)
            <div className="space-y-12">
              {processedBooks.map((userBook) => (
                <LibraryBookCard
                  key={userBook.userBookId}
                  userBook={userBook}
                  onUpdate={fetchLibrary}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
