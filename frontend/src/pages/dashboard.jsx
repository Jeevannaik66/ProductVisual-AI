import React, { useEffect, useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import { useImageStore } from "../stores/imageStore.js";

// --- Custom Hook (Industry Practice) ---
/**
 * A custom hook to detect clicks outside of a referenced element.
 * @param {Function} handler - The function to call when a click outside is detected.
 */
const useClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);

  return ref;
};

// --- Child Components (Separated for Readability) ---

// Component: Header with User Info
const DashboardHeader = ({ userName, userEmail, onLogout, onNavigateToGallery }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Use the custom hook to close the dropdown
  const dropdownRef = useClickOutside(() => setIsDropdownOpen(false));

  const displayName = userName || userEmail?.split('@')[0] || 'User';

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ProductVisual AI</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI Image Generator</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl px-4 py-2 transition-colors duration-200"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {displayName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                </div>
                <button
                  onClick={onNavigateToGallery}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>My Generations</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Component: Prompt Input with Enhancement
const PromptSection = ({ 
  prompt, 
  onPromptChange, 
  onEnhance, 
  onGenerate, 
  loadingEnhance, 
  loadingGenerate, 
  enhancedPrompt,
  originalPrompt 
}) => {
  const [showEnhancement, setShowEnhancement] = useState(false);

  return (
    <section className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Create Product Image
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Describe your product to generate AI images
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Product Description
          </label>
          <textarea
            placeholder="Example: A luxury skincare serum bottle with gold accents, natural ingredients, professional studio lighting..."
            value={prompt}
            onChange={onPromptChange}
            className="w-full h-40 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none text-lg"
            rows={5}
          />
        </div>

        {enhancedPrompt && originalPrompt && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                Enhanced Prompt
              </h3>
              <button
                onClick={() => setShowEnhancement(!showEnhancement)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showEnhancement ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>
            {showEnhancement && (
              <div className="space-y-4 text-base">
                <div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">Original:</p>
                  <p className="text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 rounded-xl p-4">{originalPrompt}</p>
                </div>
                <div>
                  <p className="text-green-800 dark:text-green-200 font-medium mb-2">Enhanced:</p>
                  <p className="text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/30 rounded-xl p-4">{enhancedPrompt}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-6 pt-4">
          <button
            onClick={onEnhance}
            disabled={loadingEnhance || !prompt.trim()}
            className="flex items-center space-x-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 px-8 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 min-w-[200px]"
          >
            {loadingEnhance ? (
              <>
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Enhancing...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Enhance Prompt</span>
              </>
            )}
          </button>

          <button
            onClick={onGenerate}
            disabled={loadingGenerate || !prompt.trim()}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 min-w-[200px]"
          >
            {loadingGenerate ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Generate Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

// Component: Generated Image Display
const ImageDisplay = ({ imageUrl, onDownload, loadingGenerate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset imageLoaded state when imageUrl changes
  useEffect(() => {
    setImageLoaded(false);
  }, [imageUrl]);

  if (!imageUrl && !loadingGenerate) return null;

  return (
    <section className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mt-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Generated Image
          </h2>
          {imageUrl && imageLoaded && (
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ready
            </span>
          )}
        </div>

        <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 min-h-[500px] flex items-center justify-center">
          {loadingGenerate && !imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-2xl">
              <div className="text-center">
                <svg className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">Generating your image...</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">This may take 10-30 seconds</p>
              </div>
            </div>
          )}

          {imageUrl && (
            <img
              src={imageUrl}
              alt="AI Generated Product Visual"
              className={`w-full h-auto max-h-[600px] object-contain rounded-2xl transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          )}

          {imageLoaded && imageUrl && (
            <div className="absolute bottom-6 right-6">
              <button
                onClick={onDownload}
                className="flex items-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-lg">Download Image</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Component: Error Display
const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="w-full mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="text-red-700 dark:text-red-300 mt-1 text-lg">{error}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
export default function Dashboard() {
  const navigate = useNavigate();

  // --- Auth Store (Separation of Concerns) ---
  // This component *assumes* it's protected.
  // We only need the user for display and the logout action.
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // --- Image Store (Single Source of Truth) ---
  // Select all state and actions needed for this page.
  const {
    prompt: promptInEditor,
    originalPrompt,
    enhancedPrompt,
    imageUrl,
    loadingEnhance,
    loadingGenerate,
    error: imageError,
  } = useImageStore((s) => ({
    prompt: s.prompt,
    originalPrompt: s.originalPrompt,
    enhancedPrompt: s.enhancedPrompt,
    imageUrl: s.imageUrl,
    loadingEnhance: s.loadingEnhance,
    loadingGenerate: s.loadingGenerate,
    error: s.error,
  }));

  const {
    setPrompt: setPromptInEditor,
    generateImage: generateImageAction,
    enhancePrompt: enhancePromptAction,
    clearGenerationState,
    clearError: clearImageError, // Using the new action
  } = useImageStore((s) => ({
    setPrompt: s.setPrompt,
    generateImage: s.generateImage,
    enhancePrompt: s.enhancePrompt,
    clearGenerationState: s.clearGenerationState,
    clearError: s.clearError,
  }));

  // --- Callbacks (Optimized) ---

  // ✅ LOGOUT
  // Simplified: Just call logout. `App.jsx` handles the redirect.
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // ✅ TEXTAREA CHANGE
  // Correctly uses store actions to manage state.
  const handlePromptChange = useCallback((e) => {
    const newText = e.target.value;
    if (enhancedPrompt) {
      // If we had an enhancement, it's now invalid.
      // Reset the generation state (which clears enhancement fields)
      clearGenerationState();
      // ...but restore the prompt the user is typing
      setPromptInEditor(newText);
    } else {
      // No enhancement, just update the prompt
      setPromptInEditor(newText);
    }
  }, [setPromptInEditor, enhancedPrompt, clearGenerationState]);

  // ✅ ENHANCE PROMPT
  // Simplified: No try/catch. The store handles its own errors.
  const onEnhance = useCallback(async () => {
    if (!promptInEditor?.trim()) return;
    enhancePromptAction(promptInEditor);
  }, [promptInEditor, enhancePromptAction]);

  // ✅ GENERATE IMAGE
  // Simplified: No try/catch. The store handles its own errors.
  // The store (in our previous optimization) handles body creation.
  const onGenerate = useCallback(async () => {
    if (!promptInEditor?.trim()) return;
    
    // Logic from the *original* file (this is fine)
    let promptToSend;
    let enhancedPromptToSend;

    if (enhancedPrompt && promptInEditor === enhancedPrompt) {
      promptToSend = originalPrompt;
      enhancedPromptToSend = enhancedPrompt;
    } else {
      promptToSend = promptInEditor;
      enhancedPromptToSend = "";
    }

    const body = { prompt: promptToSend, enhancedPrompt: enhancedPromptToSend };
    generateImageAction(body);
  }, [promptInEditor, enhancedPrompt, originalPrompt, generateImageAction]);

  // ✅ DOWNLOAD IMAGE
  const handleDownload = useCallback(() => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `product-visual-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [imageUrl]);

  // ✅ NAVIGATE TO GALLERY
  const handleNavigateToGallery = useCallback(() => {
    navigate("/generations");
  }, [navigate]);

  // ✅ DISMISS ERROR
  // Correctly calls the new `clearError` action.
  const handleDismissError = useCallback(() => {
    clearImageError();
  }, [clearImageError]);

  return (
    <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <DashboardHeader 
        userName={user?.email?.split('@')[0]}
        userEmail={user?.email}
        onLogout={handleLogout}
        onNavigateToGallery={handleNavigateToGallery}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <ErrorDisplay error={imageError} onDismiss={handleDismissError} />

          <PromptSection
            prompt={promptInEditor}
            onPromptChange={handlePromptChange}
            onEnhance={onEnhance}
            onGenerate={onGenerate}
            loadingEnhance={loadingEnhance}
            loadingGenerate={loadingGenerate}
            enhancedPrompt={enhancedPrompt}
            originalPrompt={originalPrompt}
          />

          <ImageDisplay
            imageUrl={imageUrl}
            onDownload={handleDownload}
            loadingGenerate={loadingGenerate}
          />
        </div>
      </main>
    </div>
  );
}