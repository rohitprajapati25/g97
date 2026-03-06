import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";
import logo from "../assets/logo.png"; // switched to main navbar logo

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f18] relative overflow-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-[420px] px-6">
        
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-4">
            <div className="absolute -inset-1 bg-red-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-slate-900 p-4 rounded-2xl border border-white/10 shadow-2xl">
              <img src={logo} alt="G97 Logo" className="h-16 w-auto object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            G97 <span className="text-red-600">Admin</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Control Center Access</p>
        </div>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleLogin}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-red-500 text-xs font-bold uppercase tracking-wider">{error}</p>
            </div>
          )}

          {/* EMAIL INPUT */}
          <div className="mb-5 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Administrator Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="admin@g97.com"
                className="w-full bg-slate-900/50 border border-white/10 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/50 transition-all font-medium placeholder:text-slate-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          <div className="mb-8 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-white/10 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/50 transition-all font-medium placeholder:text-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full group relative flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl shadow-red-900/20 disabled:opacity-70 overflow-hidden"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span>Secure Login</span>
                <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
              </>
            )}
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          Authorized Personnel Only &copy; 2026 G97 Auto Care
        </p>
      </div>
    </div>
  );
}

export default Login;