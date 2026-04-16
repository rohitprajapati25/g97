import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CarAuthLayout from "../../components/CarAuthLayout";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/user/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      localStorage.setItem('userToken', res.data.token);
      localStorage.setItem('userData', JSON.stringify(res.data.user));
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userPhone', res.data.user.phone || form.phone);

      toast('success', 'Account Created!', `Welcome, ${res.data.user.name}!`);
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CarAuthLayout>
      <div className="py-2">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
            Join <span className="text-red-600">Us</span>
          </h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Create your premium car care profile</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[11px] p-4 rounded-2xl mb-6 border border-red-100 font-bold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="group">
            <label className="text-xs font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Full Name</label>
            <input
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="group">
            <label className="text-xs font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Email Address</label>
            <input
              type="email"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="group">
            <label className="text-xs font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Phone Number</label>
            <input
              type="tel"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              pattern="[0-9]{10,}"
              title="Minimum 10 digit phone number"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="text-xs font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Password</label>
              <input
                type="password"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium"
                placeholder="••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="group">
              <label className="text-xs font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Confirm</label>
              <input
                type="password"
                className={`w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all outline-none font-medium ${
                  form.confirmPassword && form.password !== form.confirmPassword ? "ring-2 ring-red-400" : "focus:ring-red-500"
                }`}
                placeholder="••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!(form.confirmPassword && form.password !== form.confirmPassword)}
            className="w-full bg-red-600 hover:bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-100 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
            ) : "Create Account & Login"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm font-medium">
            Member already?{" "}
            <Link to="/user/login" className="text-red-600 font-black hover:underline ml-1 uppercase text-xs tracking-wider">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </CarAuthLayout>
  );
};

export default Register;
