"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { X, Megaphone } from "lucide-react";

interface AddAnnouncementModalProps {
  onClose: () => void;
  onAdded: (ann: any) => void;
}

export default function AddAnnouncementModal({ onClose, onAdded }: AddAnnouncementModalProps) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("NORMAL");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:4000/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, body, priority })
      });
      
      if (res.ok) {
        const newAnn = await res.json();
        onAdded(newAnn);
        onClose();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create announcement.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-surface border border-border-c rounded-xl shadow-xl w-full max-w-md animate-fade-up overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-c bg-bg/30">
          <h2 className="font-serif text-2xl font-bold">New Announcement</h2>
          <button onClick={onClose} className="p-2 -mr-2 hover:bg-bg rounded-md transition-colors">
            <X className="h-5 w-5 text-muted hover:text-text" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Office closed this Friday"
              className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary transition-colors"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Message Body</label>
            <textarea
              required
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Provide details here..."
              className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary h-32 resize-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-primary text-white font-bold text-[11px] uppercase tracking-widest py-3 rounded-md hover:brightness-110 flex items-center justify-center gap-2 mt-6 transition-all disabled:opacity-70"
          >
            {loading ? "Posting..." : "Post Announcement"} <Megaphone className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
