import { useState } from "react";
import useAuth from "@/utils/useAuth";
import SocialLoginButtons from "@/components/SocialLoginButtons";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signUpWithCredentials } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can't be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          backgroundColor: "#1E1E1E",
          boxShadow: "0 25px 50px -12px rgba(0, 255, 136, 0.25)",
        }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
          >
            Join PitchLink
          </h1>
          <p className="text-base" style={{ color: "#9CA3AF" }}>
            Create your account to book football pitches
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              style={{ color: "#FFFFFF" }}
            >
              Full Name
            </label>
            <div
              className="rounded-lg border px-4 py-3"
              style={{
                backgroundColor: "#0A0A0A",
                borderColor: "#333333",
                transition: "border-color 0.2s",
              }}
              onFocusCapture={(e) =>
                (e.target.parentElement.style.borderColor = "#00FF88")
              }
              onBlurCapture={(e) =>
                (e.target.parentElement.style.borderColor = "#333333")
              }
            >
              <input
                required
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full bg-transparent text-lg outline-none"
                style={{ color: "#FFFFFF" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              style={{ color: "#FFFFFF" }}
            >
              Email
            </label>
            <div
              className="rounded-lg border px-4 py-3"
              style={{
                backgroundColor: "#0A0A0A",
                borderColor: "#333333",
                transition: "border-color 0.2s",
              }}
              onFocusCapture={(e) =>
                (e.target.parentElement.style.borderColor = "#00FF88")
              }
              onBlurCapture={(e) =>
                (e.target.parentElement.style.borderColor = "#333333")
              }
            >
              <input
                required
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full bg-transparent text-lg outline-none"
                style={{ color: "#FFFFFF" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              style={{ color: "#FFFFFF" }}
            >
              Password
            </label>
            <div
              className="rounded-lg border px-4 py-3"
              style={{
                backgroundColor: "#0A0A0A",
                borderColor: "#333333",
                transition: "border-color 0.2s",
              }}
              onFocusCapture={(e) =>
                (e.target.parentElement.style.borderColor = "#00FF88")
              }
              onBlurCapture={(e) =>
                (e.target.parentElement.style.borderColor = "#333333")
              }
            >
              <input
                required
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-transparent text-lg outline-none"
                placeholder="Create a password (min. 6 characters)"
                style={{ color: "#FFFFFF" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              style={{ color: "#FFFFFF" }}
            >
              Confirm Password
            </label>
            <div
              className="rounded-lg border px-4 py-3"
              style={{
                backgroundColor: "#0A0A0A",
                borderColor: "#333333",
                transition: "border-color 0.2s",
              }}
              onFocusCapture={(e) =>
                (e.target.parentElement.style.borderColor = "#00FF88")
              }
              onBlurCapture={(e) =>
                (e.target.parentElement.style.borderColor = "#333333")
              }
            >
              <input
                required
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full bg-transparent text-lg outline-none"
                placeholder="Confirm your password"
                style={{ color: "#FFFFFF" }}
              />
            </div>
          </div>

          {error && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{ backgroundColor: "#FF6B0020", color: "#FF6B00" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-3 text-base font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "#00FF88",
              color: "#000000",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#00E67A")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#00FF88")}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          {/* Social Login Buttons */}
          <SocialLoginButtons loading={loading} />

          <p className="text-center text-sm" style={{ color: "#9CA3AF" }}>
            Already have an account?{" "}
            <a
              href={`/account/signin${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="hover:underline"
              style={{ color: "#00FF88" }}
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
