import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 bg-[#f8fafc]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[450px] w-[450px] rounded-full bg-indigo-100/40 blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] h-[300px] w-[300px] rounded-full bg-sky-100/20 blur-[80px]" />
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-xl rounded-[2.5rem] border border-white/80 bg-white/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-10 md:p-14 flex flex-col items-center animate-float">
        
        {/* LOGO Container with Glow */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-500" />
          <img
            src="/logo.png"
            alt="Logo"
            className="relative w-48 md:w-56 drop-shadow-2xl"
          />
        </div>

        {/* HERO TEXT */}
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-800">
            Career <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Compass</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-sm mx-auto">
            Navigate your future with AI-driven skill mapping and career insights.
          </p>
        </div>

        {/* CALL TO ACTION */}
        <div className="w-full flex flex-col items-center gap-4">
          <button
            className="group relative overflow-hidden bg-slate-900 hover:bg-blue-600 text-white px-10 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-blue-100 transition-all duration-300 hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
            onClick={() => navigate("/auth")}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Get Started
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 group-hover:translate-x-1 transition-transform" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            {/* Shimmer effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
          
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Powered by Artificial Intelligence
          </p>
        </div>
      </div>

      {/* FOOTER DECOR */}
      <div className="absolute bottom-8 text-slate-400 text-sm font-medium">
        © {new Date().getFullYear()} Career Compass EdTech
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;