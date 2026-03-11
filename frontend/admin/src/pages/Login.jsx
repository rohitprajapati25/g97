
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/admin/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("admin", JSON.stringify(response.data.admin));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // const handleRegister = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setSuccess("");
  //   setLoading(true);
  //   try {
  //     await api.post("/admin/register", { name, email, password, phone });
  //     setSuccess("Registration successful! Please login.");
  //     setIsRegister(false);
  //     setName("");
  //     setPhone("");
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Registration failed.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const toggleRegister = () => {
    setIsRegister(!isRegister);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="flex justify-center">
            <img src={logo} alt="G97 Logo" className="h-[120px] object-contain" />
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">
              {isRegister ? "Register Admin" : "Welcome back"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {isRegister ? "Create your admin account." : "Please enter admin credentials."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-500/10 border-l-4 border-green-500 text-green-400 text-sm">
              {success}
            </div>
          )}

          {isRegister ? (
            <form className="space-y-5">
              <div className="group">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block group-focus-within:text-red-500 transition-colors">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-4 pr-4 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all placeholder:text-gray-700"
                  placeholder="Admin Name"
                  required
                />
              </div>

              <div className="group">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block group-focus-within:text-red-500 transition-colors">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-4 pr-4 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all placeholder:text-gray-700"
                  placeholder="9104318605"
                  required
                />
              </div>

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
                {loading ? "Registering..." : "Register Admin"}
              </button>

              <button
                type="button"
                onClick={toggleRegister}
                className="w-full text-gray-500 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Already have an account? Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  <>Login <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          )}
        </div>
        
        <button
          type="button"
          onClick={toggleRegister}
          className="w-full mt-4 text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isRegister && "Already have an account? Login"}
        </button>
        
        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Internal System &bull; Authorized Personnel Only &bull; 2026
        </p>
      </div>
    </div>
  );
};

export default Login;

