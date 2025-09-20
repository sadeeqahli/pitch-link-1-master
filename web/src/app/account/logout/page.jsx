import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ backgroundColor: '#1E1E1E', boxShadow: '0 25px 50px -12px rgba(0, 255, 136, 0.25)' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
            Sign Out
          </h1>
          <p className="text-base" style={{ color: '#9CA3AF' }}>
            Are you sure you want to sign out of PitchLink?
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg px-4 py-3 text-base font-medium transition-colors"
          style={{ 
            backgroundColor: '#00FF88', 
            color: '#000000',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#00E67A'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#00FF88'}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default MainComponent;