"use client";
import React from "react";

function MainComponent() {
  const [files, setFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("files");
  const [selectedFile, setSelectedFile] = useState(null);
  const [newLog, setNewLog] = useState({ version: "", description: "" });
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFiles();
    fetchLogs();
    fetchAnnouncements();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/get-jsons", { method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      setError("Failed to load JSON files");
      console.error(error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/get-updates", { method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      setError("Failed to load update logs");
      console.error(error);
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
      setError("Failed to load announcements");
      console.error(error);
    }
  };

  const handleAddLog = async () => {
    if (!newLog.version || !newLog.description) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/add-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLog),
      });

      if (!response.ok) throw new Error("Failed to add update log");

      setMessage("Update log added successfully");
      setNewLog({ version: "", description: "" });
      fetchLogs();
    } catch (error) {
      setError("Failed to add update log");
      console.error(error);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      setError("Please enter an announcement message");
      return;
    }

    try {
      const response = await fetch("/api/add-announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newAnnouncement }),
      });

      if (!response.ok) throw new Error("Failed to add announcement");

      setMessage("Announcement added successfully");
      setNewAnnouncement("");
      fetchAnnouncements();
    } catch (error) {
      setError("Failed to add announcement");
      console.error(error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const response = await fetch("/api/delete-announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete announcement");

      setMessage("Announcement deleted successfully");
      fetchAnnouncements();
    } catch (error) {
      setError("Failed to delete announcement");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1929] text-white">
      <nav className="border-b border-[#1E3A5F] bg-[#0A1929]/50 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#00D1FF]">444</span>
              <span className="text-2xl font-light ml-2">Admin Dashboard</span>
            </div>
            <a
              href="/"
              className="text-[#8B9CAF] hover:text-white transition-colors"
            >
              Back to Tools
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1E3A5F]/30 rounded-2xl p-6 backdrop-blur-sm border border-[#1E3A5F]">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab("files")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "files"
                      ? "bg-[#00D1FF] text-[#0A1929]"
                      : "bg-[#1E3A5F]"
                  }`}
                >
                  JSON Files
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "logs"
                      ? "bg-[#00D1FF] text-[#0A1929]"
                      : "bg-[#1E3A5F]"
                  }`}
                >
                  Update Logs
                </button>
                <button
                  onClick={() => setActiveTab("announcements")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "announcements"
                      ? "bg-[#00D1FF] text-[#0A1929]"
                      : "bg-[#1E3A5F]"
                  }`}
                >
                  Announcements
                </button>
              </div>

              {activeTab === "files" && (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-[#0A1929] border border-[#1E3A5F] rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{file.name}</h3>
                        <button
                          onClick={() =>
                            setSelectedFile(selectedFile === file ? null : file)
                          }
                          className="text-[#00D1FF] hover:text-[#00B8E6] transition-colors"
                        >
                          {selectedFile === file ? "Hide" : "Preview"}
                        </button>
                      </div>
                      {selectedFile === file && (
                        <pre className="bg-[#0A1929] p-4 rounded mt-2 text-sm overflow-x-auto">
                          {JSON.stringify(JSON.parse(file.content), null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "logs" && (
                <div className="space-y-6">
                  <div className="bg-[#0A1929] border border-[#1E3A5F] rounded-lg p-4">
                    <input
                      type="text"
                      placeholder="Version"
                      value={newLog.version}
                      onChange={(e) =>
                        setNewLog({ ...newLog, version: e.target.value })
                      }
                      className="bg-[#1E3A5F] border border-[#1E3A5F] rounded-lg px-4 py-2 w-full mb-4"
                    />
                    <textarea
                      placeholder="Update description"
                      value={newLog.description}
                      onChange={(e) =>
                        setNewLog({ ...newLog, description: e.target.value })
                      }
                      className="bg-[#1E3A5F] border border-[#1E3A5F] rounded-lg px-4 py-2 w-full h-32 mb-4"
                    />
                    <button
                      onClick={handleAddLog}
                      className="bg-[#00D1FF] hover:bg-[#00B8E6] text-[#0A1929] font-medium px-6 py-2 rounded-lg transition-colors"
                    >
                      Add Update Log
                    </button>
                  </div>

                  <div className="space-y-4">
                    {logs.map((log) => (
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
              )}

              {activeTab === "announcements" && (
                <div className="space-y-6">
                  <div className="bg-[#0A1929] border border-[#1E3A5F] rounded-lg p-4">
                    <textarea
                      placeholder="Enter announcement message..."
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      className="bg-[#1E3A5F] border border-[#1E3A5F] rounded-lg px-4 py-2 w-full h-32 mb-4 focus:outline-none focus:border-[#00D1FF]"
                    />
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleAddAnnouncement}
                        className="bg-[#00D1FF] hover:bg-[#00B8E6] text-[#0A1929] font-medium px-6 py-2 rounded-lg transition-colors"
                      >
                        Add Announcement
                      </button>
                      <div className="flex-1 bg-[#1E3A5F]/50 rounded-full p-3">
                        <div className="bg-[#1E3A5F]/90 backdrop-blur-sm text-white px-6 py-2 rounded-full">
                          Preview:{" "}
                          {newAnnouncement ||
                            "Your announcement will appear like this"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="bg-[#0A1929] border border-[#1E3A5F] rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 bg-[#1E3A5F]/50 rounded-full p-3">
                            <div className="bg-[#1E3A5F]/90 backdrop-blur-sm text-white px-6 py-2 rounded-full">
                              {announcement.message}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteAnnouncement(announcement.id)
                            }
                            className="ml-4 text-red-500 hover:text-red-400 transition-colors"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="text-[#8B9CAF] text-sm">
                          Created:{" "}
                          {new Date(announcement.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1E3A5F]/30 rounded-2xl p-6 backdrop-blur-sm border border-[#1E3A5F]">
              <h2 className="text-xl font-semibold mb-6">Stats</h2>
              <div className="space-y-4">
                <div className="bg-[#0A1929] border border-[#1E3A5F] rounded-lg p-4">
                  <div className="text-[#8B9CAF] text-sm">Total JSON Files</div>
                  <div className="text-2xl font-bold text-[#00D1FF]">
                    {files.length}
                  </div>
                </div>
                <div className="bg-[#0A1929] border border-[#1E3A5F] rounded-lg p-4">
                  <div className="text-[#8B9CAF] text-sm">Update Logs</div>
                  <div className="text-2xl font-bold text-[#00D1FF]">
                    {logs.length}
                  </div>
                </div>
                <div className="bg-[#0A1929] border border-[#1E3A5F] rounded-lg p-4">
                  <div className="text-[#8B9CAF] text-sm">
                    Active Announcements
                  </div>
                  <div className="text-2xl font-bold text-[#00D1FF]">
                    {announcements.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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

export default MainComponent;