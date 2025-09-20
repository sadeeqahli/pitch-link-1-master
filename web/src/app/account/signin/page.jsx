import { useState } from "react";
import useAuth from "@/utils/useAuth";
import SocialLoginButtons from "@/components/SocialLoginButtons";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-in. Please try again or use a different method.",
        OAuthCallback: "Sign-in failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-in method. Try another option.",
        EmailCreateAccount:
          "This email can't be used to create an account. It may already exist.",
        Callback: "Something went wrong during sign-in. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Incorrect email or password. Try again or reset your password.",
        AccessDenied: "You don't have permission to sign in.",
        Configuration:
          "Sign-in isn't working right now. Please try again later.",
        Verification: "Your sign-in link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl p-8"
        style={{ backgroundColor: '#1E1E1E', boxShadow: '0 25px 50px -12px rgba(0, 255, 136, 0.25)' }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
            Welcome Back
          </h1>
          <p className="text-base" style={{ color: '#9CA3AF' }}>
            Sign in to your PitchLink account
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#FFFFFF' }}>
              Email
            </label>
            <div className="rounded-lg border px-4 py-3" 
                 style={{ 
                   backgroundColor: '#0A0A0A', 
                   borderColor: '#333333',
                   transition: 'border-color 0.2s'
                 }}
                 onFocusCapture={(e) => e.target.parentElement.style.borderColor = '#00FF88'}
                 onBlurCapture={(e) => e.target.parentElement.style.borderColor = '#333333'}>
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-lg outline-none"
                style={{ color: '#FFFFFF' }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#FFFFFF' }}>
              Password
            </label>
            <div className="rounded-lg border px-4 py-3"
                 style={{ 
                   backgroundColor: '#0A0A0A', 
                   borderColor: '#333333',
                   transition: 'border-color 0.2s'
                 }}
                 onFocusCapture={(e) => e.target.parentElement.style.borderColor = '#00FF88'}
                 onBlurCapture={(e) => e.target.parentElement.style.borderColor = '#333333'}>
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-lg outline-none"
                placeholder="Enter your password"
                style={{ color: '#FFFFFF' }}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: '#FF6B0020', color: '#FF6B00' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-3 text-base font-medium transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: '#00FF88', 
              color: '#000000',
              fontFamily: 'Inter, sans-serif'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#00E67A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#00FF88'}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Social Login Buttons */}
          <SocialLoginButtons loading={loading} />
          
          <p className="text-center text-sm" style={{ color: '#9CA3AF' }}>
            Don't have an account?{" "}
            <a
              href={`/account/signup${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="hover:underline"
              style={{ color: '#00FF88' }}
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;