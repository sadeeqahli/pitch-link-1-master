import React from 'react';

const SocialLoginButtons = ({ loading = false }) => {
  const handleGoogleSignIn = async () => {
    // Note: Google OAuth integration requires server-side setup
    // For now, we'll show a placeholder
    alert('Google Sign-in requires OAuth configuration. Please see SOCIAL_LOGIN_SETUP_GUIDE.md');
  };

  const handleAppleSignIn = async () => {
    // Note: Apple Sign-in for web requires additional setup with Apple's JS SDK
    // For now, we'll show a placeholder
    alert('Apple Sign-in requires additional setup. Please see SOCIAL_LOGIN_SETUP_GUIDE.md');
  };

  return (
    <div className="w-full">
      {/* Separator */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-gray-600"></div>
        <span className="mx-4 text-sm text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-600"></div>
      </div>

      {/* Social Login Buttons Container */}
      <div className="space-y-3">
        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5 mr-3"
          />
          <span className="text-base font-medium">Continue with Google</span>
        </button>

        {/* Apple Sign-in Button */}
        <button
          onClick={handleAppleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_white.svg"
            alt="Apple"
            className="w-5 h-5 mr-3"
          />
          <span className="text-base font-medium">Sign in with Apple</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;