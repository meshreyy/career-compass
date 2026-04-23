import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">

      {/* LOGO */}
      <img
        src="/logo.png"
        alt="Logo"
        className="w-56 md:w-64 mb-6 drop-shadow-lg"
      />

      {/* TITLE */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 text-center">
        Career Compass
      </h1>

      {/* SUBTITLE */}
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Discover your career path with AI-powered skill and company recommendations.
      </p>

      {/* BUTTON */}
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl 
        text-lg font-medium shadow-md hover:shadow-lg transition duration-300"
        onClick={() => navigate("/auth")}
      >
        Get Started
      </button>

    </div>
  );
};

export default Home;