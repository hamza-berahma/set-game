import { useNavigate } from 'react-router-dom';
import { Gamepad, Users } from 'lucide-react';

export default function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-beige flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Logo */}
                <div className="mb-8 border-8 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-7xl mb-2 tracking-wider uppercase text-black">SET</h2>
                    <div className="flex justify-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-set-red border-2 border-black"></div>
                        <div className="w-4 h-4 bg-set-green border-2 border-black"></div>
                        <div className="w-4 h-4 bg-set-purple border-2 border-black"></div>
                    </div>
                    <p className="uppercase text-sm tracking-widest text-black">
                        The Family Game of Visual Perception
                    </p>
                </div>

                {/* Main Buttons */}
                <div className="space-y-4 mb-8">
                    <button
                        onClick={() => navigate('/register')}
                        className="w-full h-14 bg-set-green hover:bg-[#008800] text-white border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-lg flex items-center justify-center gap-2"
                        style={{ color: '#ffffff', backgroundColor: '#00AA00' }}
                    >
                        <Users className="w-5 h-5" style={{ stroke: '#ffffff' }} />
                        Get Started
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full h-14 bg-white hover:bg-gold border-4 border-black text-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-lg flex items-center justify-center gap-2"
                    >
                        <Gamepad className="w-5 h-5" />
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

