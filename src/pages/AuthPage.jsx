// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate("/home");
      } else {
        await register(email, username, password);
        navigate("/onboarding/genres");
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuth = () => {
    window.location.href = "/oauth2/authorization/google";
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col lg:flex-row items-stretch">
      {/* Left Column: Branding & Visual Anchor */}
      <section className="relative lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 overflow-hidden bg-surface-container-low min-h-[353px] lg:min-h-screen">
        {/* Background Texture/Image Mockup */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop"
            alt="Faded cozy bookshelf in a sunlit room"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        {/* Logo */}
        <div className="z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">
              menu_book
            </span>
            <h1 className="font-headline text-3xl font-semibold italic text-primary tracking-tight">
              FindMyReads
            </h1>
          </div>
        </div>

        {/* Hero Text */}
        <div className="z-10 max-w-lg mt-12 lg:mt-0">
          <h2 className="font-headline text-5xl lg:text-7xl text-on-surface leading-[1.1] mb-6">
            Your sanctuary for{" "}
            <span className="font-headline italic">every story</span> ever told.
          </h2>
          <p className="text-on-surface-variant text-lg lg:text-xl leading-relaxed max-w-md">
            Curate your personal collection, track your progress, and rediscover
            the tactile joy of reading.
          </p>
        </div>

        {/* Footer Tag */}
        <div className="z-10 hidden lg:block">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
            The Modern Editorial Curator © 2026
          </span>
        </div>
      </section>

      {/* Right Column: Authentication Form */}
      <section className="lg:w-1/2 bg-surface flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md space-y-10">
          <header className="space-y-2">
            <h3 className="font-headline text-3xl text-on-surface font-medium">
              {isLogin ? "Welcome back" : "Begin your journey"}
            </h3>
            <p className="text-on-surface-variant font-body">
              {isLogin
                ? "Continue your journey through the shelves."
                : "Create an account to build your library."}
            </p>
          </header>

          {/* Social Authentication Grid */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleOAuth}
              type="button"
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20 hover:bg-surface-container-high transition-colors duration-200"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Logo"
                className="w-5 h-5"
              />
              <span className="font-label text-sm font-semibold text-on-surface">
                Google
              </span>
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="flex-shrink mx-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
              Or with email
            </span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-sm font-label text-primary bg-primary/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1 animate-fade-in">
                <label
                  htmlFor="username"
                  className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="reader_123"
                  required={!isLogin}
                  minLength={3}
                  maxLength={30}
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 focus:ring-0 focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/40 font-body text-on-surface"
                />
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                required
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 focus:ring-0 focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/40 font-body text-on-surface"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <label
                  htmlFor="password"
                  className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1"
                >
                  Password
                </label>
                {isLogin && (
                  <a
                    href="#"
                    className="font-label text-[10px] text-primary font-bold hover:underline"
                  >
                    Forgot?
                  </a>
                )}
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-1 focus:ring-0 focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/40 font-body text-on-surface"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-[1.5rem] bg-gradient-to-r from-primary to-primary-container text-on-primary font-label text-sm font-bold tracking-widest uppercase shadow-[0_8px_20px_rgba(164,55,0,0.15)] hover:shadow-[0_12px_24px_rgba(164,55,0,0.25)] transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading
                  ? "Processing..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </div>
          </form>

          <footer className="text-center">
            <p className="text-on-surface-variant text-sm">
              {isLogin ? "New to FindMyReads? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                type="button"
                className="text-secondary font-bold hover:underline decoration-secondary/30 underline-offset-4"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </footer>

          {/* Secondary Visual Element: Reading Progress Ribbons */}
          <div className="pt-8 flex justify-center gap-2">
            <div className="w-1 h-8 bg-tertiary rounded-full opacity-20"></div>
            <div className="w-1 h-12 bg-primary rounded-full opacity-40"></div>
            <div className="w-1 h-6 bg-secondary rounded-full opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Visual Polish: Subtle Film Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100]"
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/1k_Dissolve_Noise_Texture.png/1024px-1k_Dissolve_Noise_Texture.png')",
        }}
      ></div>
    </main>
  );
}
