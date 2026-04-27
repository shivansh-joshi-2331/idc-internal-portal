"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user, token, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // @ts-ignore - bio, skills, funFact might be missing from User type initially
  const [bio, setBio] = useState(user?.bio || "");
  // @ts-ignore
  const [skillsStr, setSkillsStr] = useState((user?.skills || []).join(", "));
  // @ts-ignore
  const [funFact, setFunFact] = useState(user?.funFact || "");

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const skills = skillsStr.split(",").map(s => s.trim()).filter(Boolean);
    
    try {
      const res = await fetch(`http://localhost:4000/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bio, skills, funFact })
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        updateUser(updatedUser);
        onClose();
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-surface border border-border-c rounded-xl shadow-xl w-full max-w-md animate-fade-up overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-c bg-bg/30">
          <h2 className="font-serif text-2xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-2 -mr-2 hover:bg-bg rounded-md transition-colors">
            <X className="h-5 w-5 text-muted hover:text-text" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto space-y-5">
          <div className="flex items-center gap-4 mb-2">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white shadow-sm"
              style={{ background: user.avatarGradient }}
            >
              {user.initials}
            </div>
            <div>
              <div className="text-lg font-bold">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-muted">{user.jobTitle}</div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell the team a little about yourself..."
              className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary h-24 resize-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Skills (comma separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={e => setSkillsStr(e.target.value)}
              placeholder="e.g. React, Figma, Strategy..."
              className="w-full border border-border-c bg-bg rounded-md px-3 py-2.5 text-[13px] outline-none focus:border-accent-primary transition-colors"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Fun Fact</label>
            <input
              type="text"
              value={funFact}
              onChange={e => setFunFact(e.target.value)}
              placeholder="e.g. I can juggle 4 apples"
              className="w-full border border-border-c bg-bg rounded-md px-3 py-2.5 text-[13px] outline-none focus:border-accent-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-primary text-white font-bold text-[11px] uppercase tracking-widest py-3 rounded-md hover:brightness-110 flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Profile"} <Save className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
