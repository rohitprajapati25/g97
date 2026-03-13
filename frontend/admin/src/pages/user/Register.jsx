import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CarAuthLayout from "../../components/CarAuthLayout";
import FailedAttemptsModal from "../../components/FailedAttemptsModal";
import api from "../../api/axios";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = registration, 2 = OTP verification
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [showFailedModal, setShowFailedModal] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
        password: form.password,
      });
      
      // Show dev mode notice if email not configured
      if (res.data.isDevMode) {
        setSuccess("Registration successful! DEV MODE: Check server console for OTP.");
      } else {
        setSuccess(res.data.message || "Registration successful!");
      }
      
      setStep(2);
      // Start resend timer
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/user/verify-otp", {
        email: form.email,
        otp: otp
      });
      
      if (res.data.message && res.data.message.includes("3 failed attempts. Please register again.")) {
        console.log('🎯 3 FAILED DETECTED - SHOWING MODAL');
        setShowFailedModal(true);
        return;
      }
      
      setSuccess(res.data.message || "Email verified successfully!");
      setTimeout(() => navigate("/user/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setError("");
    try {
      setLoading(true);
      const res = await api.post("/user/resend-otp", {
        email: form.email,
      });
      setSuccess(res.data.message || "New OTP sent!");
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CarAuthLayout>
        <div className="py-2">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
              {step === 1 ? "Join " : "Verify "}<span className="text-red-600">{step === 1 ? "Us" : "Email"}</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              {step === 1 
                ? "Create your premium car care profile" 
                : `Enter the OTP sent to ${form.email}`}
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-[11px] p-4 rounded-2xl mb-6 border border-red-100 font-bold">{error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-600 text-[11px] p-4 rounded-2xl mb-6 border border-emerald-100 font-bold text-center italic">✓ {success}</div>}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Full Name</label>
                <input
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="group">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Email Address</label>
                <input
                  type="email"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Password</label>
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
                  <label className="text-[10px] font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Confirm</label>
                  <input
                    type="password"
                    className={`w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all outline-none font-medium ${
                      form.confirmPassword && form.password !== form.confirmPassword ? "ring-2 ring-red-400" : ""
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
                disabled={loading || (form.confirmPassword && form.password !== form.confirmPassword)}
                className="w-full bg-red-600 hover:bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-100 disabled:opacity-50 mt-4"
              >
                {loading ? "Creating Account..." : "Register Now"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-2 mb-1 block tracking-widest group-focus-within:text-red-500">Verification Code</label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none font-medium text-center text-2xl tracking-[0.5em]"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-red-600 hover:bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-100 disabled:opacity-50 mt-4"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              <div className="text-center mt-4">
                {resendTimer > 0 ? (
                  <p className="text-gray-400 text-xs font-medium">Resend OTP in {resendTimer}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-red-600 text-xs font-bold uppercase tracking-wider hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-gray-500 text-xs font-medium hover:text-gray-700"
                >
                  ← Back to Registration
                </button>
              </div>
            </form>
          )}

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
      
      <FailedAttemptsModal 
        isOpen={showFailedModal} 
        onClose={() => setShowFailedModal(false)} 
      />
    </>
  );
};

export default Register;
