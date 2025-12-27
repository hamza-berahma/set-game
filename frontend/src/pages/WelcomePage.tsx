import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad, Users, BookOpen } from 'lucide-react';
import TutorialModal from '../components/TutorialModal';
import { useModal } from '../hooks/useModal';
import LetterCard from '../components/LetterCard';

export default function WelcomePage() {
    const navigate = useNavigate();
    const tutorialModal = useModal();

    useEffect(() => {
        document.title = 'SET Game - Welcome';
    }, []);

    return (
        <div className="min-h-screen bg-beige flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8 border-8 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <LetterCard letter="S" color="red" className="transform hover:scale-105 transition-transform duration-200" />
                        <LetterCard letter="E" color="green" className="transform hover:scale-105 transition-transform duration-200" />
                        <LetterCard letter="T" color="purple" className="transform hover:scale-105 transition-transform duration-200" />
                    </div>
                    <p className="uppercase text-sm tracking-widest text-black">
                        The Family Game of Visual Perception
                    </p>
                </div>

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

                    <button
                        onClick={tutorialModal.open}
                        className="w-full h-14 bg-set-purple hover:bg-[#5500AA] text-white border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-lg flex items-center justify-center gap-2"
                        style={{ color: '#ffffff', backgroundColor: '#6600CC' }}
                    >
                        <BookOpen className="w-5 h-5" style={{ stroke: '#ffffff' }} />
                        How to Play
                    </button>
                </div>

                <TutorialModal
                    isOpen={tutorialModal.isOpen}
                    onClose={tutorialModal.close}
                />
            </div>
        </div>
    );
}

