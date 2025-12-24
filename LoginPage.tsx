import { useState } from "react";
import { Eye, EyeOff, Lock, CreditCard, Fingerprint, ArrowLeft } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !password) {
      setError("Please enter both Customer ID and Password.");
      return;
    }

    setError("");
    onLogin();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Blue top header */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-b-3xl shadow-lg" />

      <div className="w-full max-w-md relative">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white/90 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Logo + heading */}
        <div className="text-center mb-8 mt-2">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl" />
          </div>

          <h1 className="text-white text-2xl font-semibold">
            Welcome back
          </h1>
          <p className="text-white/80 text-sm">
            Securely sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer ID
              </label>

              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-wider"
                  placeholder="Enter Customer ID"
                />
              </div>

              <p className="text-xs text-gray-500 mt-1 ml-1">
                You’ll find this in your welcome email
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </p>
            )}

            {/* Forgot password */}
            <div className="flex justify-end">
              <button type="button" className="text-sm text-indigo-600 hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Sign in */}
            <button
              type="submit"
              disabled={!customerId || !password}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all"
            >
              Sign in
            </button>
          </form>

          {/* Divider + biometric */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Fingerprint className="w-5 h-5" />
              <span>Biometric login</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              First-time user?{" "}
              <span className="text-indigo-600">Use your temporary password</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
