import React, { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function Home() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (prompt.trim()) {
      navigate("/builder", { state: { prompt } });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    "Create a simple todo app",
    "Build the backend for a blog website",
    "Create a portfolio website",
    "Create an ecommerce website",
    "Code a landing page for my SaaS",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    navigate("/builder", { state: { prompt: suggestion } });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            What do you want to build?
          </h1>
          <p className="text-xl text-gray-400">
            Build websites and servers in React and Node.js.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden border border-gray-800">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How can I help you today?"
                className="w-full h-32 p-4 bg-gray-900/50 text-gray-100 focus:outline-none resize-none placeholder-gray-500"
              />
              {prompt.trim() && (
                <button
                  type="submit"
                  className="absolute right-3 bottom-3 p-3 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
