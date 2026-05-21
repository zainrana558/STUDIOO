'use client';

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaSpinner } from "react-icons/fa";
import { useState } from "react";


export default function LoginCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? location.origin}/auth/callback`,
        },
      });
      if (oauthError) {
        setError(oauthError.message || "Sign in failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 max-w-sm w-full text-center">
      <h1 className="text-3xl font-bold text-white mb-2">Welcome to Lumina</h1>
      <p className="text-gray-400 mb-6">Sign in to continue</p>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      <motion.button
        onClick={handleLogin}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-gray-800 border border-gray-700/80 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 transition-colors duration-300 hover:bg-gray-700/60 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <FaSpinner className="animate-spin text-white" />
        ) : (
          <>
            <FcGoogle className="text-2xl" />
            <span className="text-white font-medium">Sign in with Google</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
