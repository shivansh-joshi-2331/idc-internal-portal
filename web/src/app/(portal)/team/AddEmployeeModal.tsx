"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { X, Plus, CheckCircle2, Copy } from "lucide-react";

interface AddEmployeeModalProps {
  onClose: () => void;
  onAdded: (user: any) => void;
}

export default function AddEmployeeModal({ onClose, onAdded }: AddEmployeeModalProps) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "DESIGN",
    jobTitle: "",
    role: "EMPLOYEE"
  });
  
  const [successData, setSuccessData] = useState<{email: string, password: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:4000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const newUser = await res.json();
        onAdded(newUser);
        setSuccessData({ email: formData.email, password: formData.password });
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create user.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-surface border border-border-c rounded-xl shadow-xl w-full max-w-md animate-fade-up overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-c bg-bg/30">
          <h2 className="font-serif text-2xl font-bold">{successData ? "Employee Added" : "Add Employee"}</h2>
          <button onClick={onClose} className="p-2 -mr-2 hover:bg-bg rounded-md transition-colors">
            <X className="h-5 w-5 text-muted hover:text-text" />
          </button>
        </div>
        
        {successData ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Successfully Created!</h3>
            <p className="text-[13px] text-muted mb-6">
              The employee account is ready. Please share these temporary credentials with them.
            </p>
            
            <div className="w-full bg-bg border border-border-c rounded-lg p-4 mb-6 text-left space-y-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Email</div>
                <div className="text-[13px] font-medium">{successData.email}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Temporary Password</div>
                <div className="text-[13px] font-mono">{successData.password}</div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Login URL: http://localhost:3000\nEmail: ${successData.email}\nPassword: ${successData.password}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex-1 bg-surface border border-border-c text-text font-bold text-[11px] uppercase tracking-widest py-3 rounded-md hover:bg-bg flex items-center justify-center gap-2 transition-all"
              >
                {copied ? "Copied!" : "Copy Details"} <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-accent-primary text-white font-bold text-[11px] uppercase tracking-widest py-3 rounded-md hover:brightness-110 flex items-center justify-center transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">First Name</label>
              <input
                required
                type="text"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Last Name</label>
              <input
                required
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Email</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Temporary Password</label>
            <input
              required
              type="password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary transition-colors"
              >
                <option value="DESIGN">Design</option>
                <option value="STRATEGY">Strategy</option>
                <option value="VIDEO">Video</option>
                <option value="OPS">Ops</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary transition-colors"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted block mb-1.5">Job Title</label>
            <input
              required
              type="text"
              value={formData.jobTitle}
              onChange={e => setFormData({...formData, jobTitle: e.target.value})}
              className="w-full border border-border-c bg-bg rounded-md px-3 py-2 text-[13px] outline-none focus:border-accent-primary transition-colors"
            />
          </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-primary text-white font-bold text-[11px] uppercase tracking-widest py-3 rounded-md hover:brightness-110 flex items-center justify-center gap-2 mt-6 transition-all disabled:opacity-70"
            >
              {loading ? "Adding..." : "Add Employee"} <Plus className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
