import { useNavigate } from "react-router-dom";


const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
    <img src="/logo.png" alt="Logo" className="w-40 mb-6" />
      <h1 className="text-3xl font-bold mb-4">Career Compass</h1>

      <button
        className="bg-blue-500 text-white px-6 py-2 rounded"
        onClick={() => navigate("/auth")}
      >
        Get Started
      </button>
    </div>
  );
};

export default Home;