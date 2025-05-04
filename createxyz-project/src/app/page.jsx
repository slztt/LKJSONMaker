"use client";
import React from "react";

function MainComponent() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [jsonContent, setJsonContent] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = React.useRef();
  const [showUpdateLogs, setShowUpdateLogs] = useState(false);
  const [updateLogs, setUpdateLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(
    new Set()
  );
  const [savedJsons, setSavedJsons] = useState([]);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [formatFileName, setFormatFileName] = useState("");
  const [selectedJsons, setSelectedJsons] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchUpdateLogs();
    fetchAnnouncements();
    fetchSavedJsons();
  }, []);

  const fetchUpdateLogs = async () => {
    try {
      const response = await fetch("/api/get-updates", { method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch updates");
      const data = await response.json();
      setUpdateLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to load update logs:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/get-announcements", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to fetch announcements");
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error("Failed to load announcements:", error);
    }
  };

  const fetchSavedJsons = async () => {
    try {
      const response = await fetch("/api/get-jsons", { method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch saved JSONs");
      const data = await response.json();
      setSavedJsons(data.files || []);
    } catch (error) {
      console.error("Failed to load saved JSONs:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error("Failed to verify password");

      const data = await response.json();
      if (data.isValid) {
        setIsAdmin(true);
        setShowLoginModal(false);
        setPassword("");
        window.location.href = "/admin-dashboard"; // This will be created next
      } else {
        setError("Invalid password");
      }
    } catch (error) {
      setError("Failed to verify password");
      console.error(error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setJsonContent(e.target.result);
        setFileName(file.name.replace(".json", ""));
      };
      reader.readAsText(file);
    }
  };

  const handleSave = async () => {
    if (!fileName.trim()) {
      setError("Please enter a file name");
      return;
    }

    try {
      const response = await fetch("/api/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fileName, content: jsonContent }),
      });

      if (!response.ok) throw new Error("Failed to save file");

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      setMessage("File saved successfully!");
      setFileName("");
      setJsonContent("");
      fetchSavedJsons(); // Refresh the list after saving
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(
        error instanceof SyntaxError
          ? "Invalid JSON format"
          : "Failed to save file"
      );
    }
  };

  const validateAndFormat = () => {
    try {
      const parsed = JSON.parse(jsonContent);

      // ✅ Inject version: 1 if not already present
      if (typeof parsed === "object" && parsed !== null && !parsed.version) {
        parsed.version = 1;
      }
      
      const formatted = JSON.stringify(parsed, null, 2);
      
      setJsonContent(formatted);
      setShowFormatModal(true);
    } catch (error) {
      setError("Invalid JSON format");
    }
  };

  const handleFormatDownload = () => {
    if (!formatFileName) {
      setError("Please enter a file name");
      return;
    }

    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = formatFileName.endsWith(".json")
      ? formatFileName
      : `${formatFileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowFormatModal(false);
    setFormatFileName("");
    setMessage("JSON formatted and downloaded!");
    setTimeout(() => setMessage(""), 3000);
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed));
      setMessage("JSON minified!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError("Invalid JSON format");
    }
  };

  const loadSavedJson = (content) => {
    try {
      const parsed = JSON.parse(content);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setMessage("JSON loaded successfully!");
      setTimeout(() => setMessage(""), 3000);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setError("Failed to load JSON");
    }
  };

  const toggleJsonSelection = (id) => {
    if (!isSelectionMode) return;

    setSelectedJsons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const deleteSelectedJsons = async () => {
    if (selectedJsons.size === 0) return;

    try {
      const response = await fetch("/api/delete-jsons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedJsons) }),
      });

      if (!response.ok) throw new Error("Failed to delete files");

      setMessage(
        `Successfully deleted ${selectedJsons.size} file${
          selectedJsons.size > 1 ? "s" : ""
        }`
      );
      setSelectedJsons(new Set());
      setIsSelectionMode(false);
      fetchSavedJsons();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete JSONs:", error);
      setError("Failed to delete selected files");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1929] text-white">
      {/* Move announcements to bottom */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 space-y-4 w-full max-w-2xl px-4">
        {announcements.map(
          (announcement) =>
            !dismissedAnnouncements.has(announcement.id) && (
              <div
                key={announcement.id}
                className="bg-[#1E3A5F]/90 backdrop-blur-sm text-white px-8 py-3 rounded-full shadow-lg flex items-center justify-between animate-bounce-slow"
              >
                <span>{announcement.message}</span>
                <button
                  onClick={() =>
                    setDismissedAnnouncements(
                      (prev) => new Set([...prev, announcement.id])
                    )
                  }
                  className="ml-4 text-[#8B9CAF] hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )
        )}
      </div>

      {/* Navigation */}
      <nav className="border-b border-[#1E3A5F] bg-[#0A1929]/50 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#00D1FF]">444</span>
              <span className="text-2xl font-light ml-2">JSON Tools</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://discord.gg/9SdxtM66S6"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Join Discord</span>
              </a>
              <button
                onClick={() => setShowUpdateLogs(true)}
                className="bg-[#1E3A5F] hover:bg-[#2A4A7F] px-4 py-2 rounded-lg transition-colors"
              >
                Update Logs
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-[#1E3A5F] hover:bg-[#2A4A7F] px-4 py-2 rounded-lg transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">JSON Converter & Tools</h1>
          <p className="text-[#8B9CAF]">
            Build and manage JSON configurations with an intuitive interface
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-[#1E3A5F]/30 rounded-2xl p-6 backdrop-blur-sm border border-[#1E3A5F]">
              <div className="flex items-center gap-4 mb-6">
                <input
                  type="text"
                  placeholder="File name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="flex-1 bg-[#0A1929] border border-[#1E3A5F] rounded-lg px-4 py-2 focus:outline-none focus:border-[#00D1FF]"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-[#1E3A5F] hover:bg-[#2A4A7F] px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  Upload File
                </button>
              </div>
              <textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                placeholder="Enter or paste JSON here..."
                className="w-full h-[400px] bg-[#0A1929] border border-[#1E3A5F] rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-[#00D1FF]"
              />
            </div>
          </div>

          {/* Tools Section */}
          <div className="space-y-6">
            <div className="bg-[#1E3A5F]/30 rounded-2xl p-6 backdrop-blur-sm border border-[#1E3A5F]">
              <h2 className="text-xl font-semibold mb-6">Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={validateAndFormat}
                  className="bg-[#00D1FF] hover:bg-[#00B8E6] text-[#0A1929] font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Format JSON
                </button>
                <button
                  onClick={minifyJson}
                  className="bg-[#1E3A5F] hover:bg-[#2A4A7F] px-6 py-3 rounded-xl transition-colors"
                >
                  Minify JSON
                </button>
                <button
                  onClick={handleSave}
                  className="bg-[#00D1FF] hover:bg-[#00B8E6] text-[#0A1929] font-medium px-6 py-3 rounded-xl transition-colors sm:col-span-2"
                >
                  Save JSON
                </button>
              </div>
            </div>

            <div className="bg-[#1E3A5F]/30 rounded-2xl p-6 backdrop-blur-sm border border-[#1E3A5F]">
              <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
              <ul className="space-y-3 text-[#8B9CAF]">
                <li>• Use Format JSON to validate and beautify your JSON</li>
                <li>
                  • Minify JSON removes all whitespace for smaller file size
                </li>
                <li>
                  • Save your JSON files for later use in the admin dashboard
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Saved JSONs Section */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Saved JSONs</h2>
            <div className="flex gap-4">
              {isSelectionMode && (
                <button
                  onClick={deleteSelectedJsons}
                  disabled={selectedJsons.size === 0}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedJsons.size > 0
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-red-500/50 cursor-not-allowed"
                  }`}
                >
                  Delete Selected ({selectedJsons.size})
                </button>
              )}
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedJsons(new Set());
                }}
                className="bg-[#1E3A5F] hover:bg-[#2A4A7F] px-4 py-2 rounded-lg transition-colors"
              >
                {isSelectionMode ? "Cancel" : "Select Multiple"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJsons.map((file) => (
              <div
                key={file.id}
                className={`bg-[#1E3A5F]/30 rounded-2xl p-6 backdrop-blur-sm border transition-colors ${
                  isSelectionMode
                    ? selectedJsons.has(file.id)
                      ? "border-[#00D1FF]"
                      : "border-[#1E3A5F] hover:border-[#00D1FF]"
                    : "border-[#1E3A5F] hover:border-[#00D1FF] cursor-pointer"
                }`}
                onClick={() =>
                  isSelectionMode
                    ? toggleJsonSelection(file.id)
                    : loadSavedJson(file.content)
                }
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium truncate">{file.name}</h3>
                  <div className="flex items-center gap-2">
                    {isSelectionMode && (
                      <div
                        className={`w-5 h-5 rounded border ${
                          selectedJsons.has(file.id)
                            ? "bg-[#00D1FF] border-[#00D1FF]"
                            : "border-[#8B9CAF]"
                        }`}
                      >
                        {selectedJsons.has(file.id) && (
                          <svg
                            className="w-5 h-5 text-[#0A1929]"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                    <span className="text-[#8B9CAF] text-sm">
                      {new Date(file.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="bg-[#0A1929] rounded-lg p-4 h-32 overflow-hidden">
                  <pre className="text-[#8B9CAF] text-sm whitespace-pre-wrap">
                    {file.content}
                  </pre>
                </div>
              </div>
            ))}
            {savedJsons.length === 0 && (
              <div className="col-span-full text-center text-[#8B9CAF] py-12">
                <p>You haven't saved any JSONs yet.</p>
                <p className="mt-2">
                  Save your first JSON above to see it here!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Format JSON Modal */}
      {showFormatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E3A5F] rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-semibold mb-6">
              Download Formatted JSON
            </h2>
            <input
              type="text"
              placeholder="Enter file name"
              value={formatFileName}
              onChange={(e) => setFormatFileName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleFormatDownload()}
              className="w-full bg-[#0A1929] border border-[#1E3A5F] rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-[#00D1FF]"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowFormatModal(false);
                  setFormatFileName("");
                }}
                className="px-6 py-2 text-[#8B9CAF] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFormatDownload}
                className="bg-[#00D1FF] hover:bg-[#00B8E6] text-[#0A1929] font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Logs Modal */}
      {showUpdateLogs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E3A5F] rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Update Logs</h2>
              <button
                onClick={() => setShowUpdateLogs(false)}
                className="text-[#8B9CAF] hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {updateLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#0A1929] border border-[#1E3A5F] rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Version {log.version}</h3>
                    <span className="text-[#8B9CAF] text-sm">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#8B9CAF]">{log.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E3A5F] rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-semibold mb-6">Admin Login</h2>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-[#0A1929] border border-[#1E3A5F] rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-[#00D1FF]"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setPassword("");
                }}
                className="px-6 py-2 text-[#8B9CAF] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="bg-[#00D1FF] hover:bg-[#00B8E6] text-[#0A1929] font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-lg">
          {error}
        </div>
      )}
      {message && (
        <div className="fixed bottom-4 right-4 bg-[#00D1FF]/90 backdrop-blur-sm text-[#0A1929] font-medium px-6 py-3 rounded-xl shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}

<style jsx global>{`
  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  .animate-bounce-slow {
    animation: bounce-slow 3s infinite ease-in-out;
  }
`}</style>;

export default MainComponent;