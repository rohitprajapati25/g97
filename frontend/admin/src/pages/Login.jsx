import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Car, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, Fingerprint } from "lucide-react";
import logo from "../assets/logo.png"; // 🔥 LOGO PATH (use main navbar logo)


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/admin/login", { email, password });
      if (response.data.otpRequired) {
        setOtpSent(true);
      } else if (response.data.token) {
        saveLogin(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/admin/login", { email, password, otp });
      if (response.data.token) saveLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid security code.");
    } finally {
      setLoading(false);
    }
  };

  const saveLogin = (data) => {
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("admin", JSON.stringify(data.admin));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex justify-center ">
                             <img
                               src={logo}
                               alt="G97 Logo"
                               className="h-[120px] object-contain"
                             />
                  </div>
          
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">
              {!otpSent ? "Welcome back" : "Verify Identity"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {!otpSent ? "Please enter admin credentials." : "Security code sent to your inbox."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm animate-pulse">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="group">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block group-focus-within:text-red-500 transition-colors">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all placeholder:text-gray-700"
                    placeholder="admin@autohub.com"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block group-focus-within:text-red-500 transition-colors">
                  Secure Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all placeholder:text-gray-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                {loading ? "Authorizing..." : (
                  <>Continue <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex justify-center py-4">
                <Fingerprint className="w-16 h-16 text-red-500 opacity-80" />
              </div>
              
              <div className="text-center">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 block">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-black/60 border border-red-900/50 rounded-2xl py-5 text-center text-4xl tracking-[1rem] font-black text-red-500 outline-none focus:border-red-500 transition-all shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]"
                  placeholder="000000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Verifying..." : "Confirm Access"}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-gray-500 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Use different credentials
              </button>
            </form>
          )}
        </div>
        
        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Internal System &bull; Authorized Personnel Only &bull; 2026
        </p>
      </div>
    </div>
  );
};

export default Login;