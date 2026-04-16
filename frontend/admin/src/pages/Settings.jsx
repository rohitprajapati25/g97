import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";
import { User, Mail, Phone, Lock, Save } from "lucide-react";

export default function Settings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admin, setAdmin] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get("/admin/me", { headers: { Authorization: `Bearer ${token}` } });
      setAdmin(res.data);
      setName(res.data.name || "");
      setEmail(res.data.email || "");
      setPhone(res.data.phone || "");
    } catch (err) {
      toast('error', 'Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await api.put("/admin/profile",
        { name, email, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdmin(prev => ({ ...prev, name, email, phone }));
      toast('success', 'Saved', res.data.message || 'Profile updated successfully');
    } catch (err) {
      toast('error', 'Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('error', 'Mismatch', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast('error', 'Too Short', 'Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await api.put("/admin/password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast('success', 'Updated', res.data.message || 'Password changed successfully');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast('error', 'Error', err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-darkbg">
        <div className="h-16 w-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] mt-6">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-darkbg min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-red-600"></span>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Settings</p>
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">
            Account <span className="text-red-600">Settings</span>
          </h2>
        </div>

        {/* Profile Settings */}
        <div className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-8 mb-8">
          <h3 className="text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-3">
            <User className="text-red-500" size={24} />
            Profile Information
          </h3>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-8">
          <h3 className="text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-3">
            <Lock className="text-red-500" size={24} />
            Change Password
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div></div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Changing..." : (
                  <>
                    <Lock size={18} />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

