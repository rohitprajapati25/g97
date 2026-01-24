import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CarAuthLayout from "../../components/CarAuthLayout";
import api from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/user/login", { email, password });
      if (res.data.token) {
        localStorage.setItem("userToken", res.data.token);
        localStorage.setItem("userName", res.data.user.name);
        localStorage.setItem("userEmail", res.data.user.email);
        navigate("/", { replace: true });
      } else {
        setError("Login failed - no token received");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CarAuthLayout>
      <div className="py-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            Sign <span className="text-red-600">In</span>
          </h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Access your premium car care dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-4 rounded-2xl mb-6 border border-red-100 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500 transition-colors">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none text-slate-900 font-medium placeholder:text-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="group">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500 transition-colors">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none text-slate-900 font-medium placeholder:text-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 hover:shadow-red-600/20 disabled:opacity-50 mt-4"
          >
            {loading ? "Authenticating..." : "Login to Account"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm font-medium">
            Don't have an account?{" "}
            <Link to="/user/register" className="text-red-600 font-black hover:underline ml-1 uppercase text-xs tracking-wider">
              Create One
            </Link>
          </p>
        </div>
      </div>
    </CarAuthLayout>
  );
};

export default Login;