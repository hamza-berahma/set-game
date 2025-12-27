import { useState } from 'react';
import Modal from './Modal';
import Card from './Card';
import type { Card as CardType } from '../types/game';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Example cards for tutorial
const validSetExample: CardType[] = [
    { id: '1', number: 1, shape: 'diamond', shading: 'solid', color: 'red' },
    { id: '2', number: 2, shape: 'diamond', shading: 'solid', color: 'red' },
    { id: '3', number: 3, shape: 'diamond', shading: 'solid', color: 'red' },
];

const validSetExample2: CardType[] = [
    { id: '4', number: 1, shape: 'oval', shading: 'solid', color: 'red' },
    { id: '5', number: 1, shape: 'oval', shading: 'striped', color: 'green' },
    { id: '6', number: 1, shape: 'oval', shading: 'open', color: 'purple' },
];

const invalidSetExample: CardType[] = [
    { id: '7', number: 1, shape: 'diamond', shading: 'solid', color: 'red' },
    { id: '8', number: 2, shape: 'oval', shading: 'solid', color: 'red' },
    { id: '9', number: 3, shape: 'squiggle', shading: 'striped', color: 'red' },
];

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: 'What is SET?',
            content: (
                <div className="space-y-4">
                    <p className="text-lg uppercase tracking-wider text-black">
                        SET is a card game where you find groups of 3 cards that form a SET.
                    </p>
                    <p className="text-black">
                        Each card has 4 attributes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-black ml-4">
                        <li><strong>Number:</strong> 1, 2, or 3 shapes</li>
                        <li><strong>Shape:</strong> Diamond, Oval, or Squiggle</li>
                        <li><strong>Shading:</strong> Solid, Striped, or Open</li>
                        <li><strong>Color:</strong> Red, Green, or Purple</li>
                    </ul>
                </div>
            ),
        },
        {
            title: 'How to Form a SET',
            content: (
                <div className="space-y-4">
                    <p className="text-lg uppercase tracking-wider text-black mb-4">
                        For 3 cards to be a SET, each attribute must be:
                    </p>
                    <div className="bg-beige border-4 border-black p-4 mb-4">
                        <p className="font-bold text-black mb-2">✓ All the SAME, OR</p>
                        <p className="font-bold text-black">✓ All DIFFERENT</p>
                    </div>
                    <p className="text-black">
                        This must be true for <strong>all 4 attributes</strong> (number, shape, shading, color).
                    </p>
                </div>
            ),
        },
        {
            title: 'Valid SET Example #1',
            content: (
                <div className="space-y-4">
                    <p className="text-lg uppercase tracking-wider text-black mb-4">
                        All attributes are the SAME:
                    </p>
                    <div className="flex justify-center gap-4 mb-4">
                        {validSetExample.map((card) => (
                            <Card key={card.id} card={card} />
                        ))}
                    </div>
                    <div className="bg-set-green border-4 border-black p-4">
                        <p className="text-white font-bold uppercase tracking-wider mb-2">✓ Valid SET!</p>
                        <ul className="text-white text-sm space-y-1">
                            <li>• Number: All 1, 2, 3 (all different) ✓</li>
                            <li>• Shape: All diamonds (all same) ✓</li>
                            <li>• Shading: All solid (all same) ✓</li>
                            <li>• Color: All red (all same) ✓</li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            title: 'Valid SET Example #2',
            content: (
                <div className="space-y-4">
                    <p className="text-lg uppercase tracking-wider text-black mb-4">
                        All attributes are DIFFERENT:
                    </p>
                    <div className="flex justify-center gap-4 mb-4">
                        {validSetExample2.map((card) => (
                            <Card key={card.id} card={card} />
                        ))}
                    </div>
                    <div className="bg-set-green border-4 border-black p-4">
                        <p className="text-white font-bold uppercase tracking-wider mb-2">✓ Valid SET!</p>
                        <ul className="text-white text-sm space-y-1">
                            <li>• Number: All 1 (all same) ✓</li>
                            <li>• Shape: All ovals (all same) ✓</li>
                            <li>• Shading: Solid, Striped, Open (all different) ✓</li>
                            <li>• Color: Red, Green, Purple (all different) ✓</li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            title: 'Invalid SET Example',
            content: (
                <div className="space-y-4">
                    <p className="text-lg uppercase tracking-wider text-black mb-4">
                        This is NOT a valid SET:
                    </p>
                    <div className="flex justify-center gap-4 mb-4">
                        {invalidSetExample.map((card) => (
                            <Card key={card.id} card={card} />
                        ))}
                    </div>
                    <div className="bg-set-red border-4 border-black p-4">
                        <p className="text-white font-bold uppercase tracking-wider mb-2">✗ Invalid SET</p>
                        <ul className="text-white text-sm space-y-1">
                            <li>• Number: 1, 2, 3 (all different) ✓</li>
                            <li>• Shape: Diamond, Oval, Squiggle (all different) ✓</li>
                            <li>• Shading: Solid, Solid, Striped (NOT all same or all different) ✗</li>
                            <li>• Color: All red (all same) ✓</li>
                        </ul>
                        <p className="text-white text-sm mt-2">
                            Since shading is not all same or all different, this is NOT a SET.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: 'How to Play',
            content: (
                <div className="space-y-4">
                    <div className="space-y-3 text-black">
                        <div className="flex items-start gap-3">
                            <span className="font-bold text-2xl">1.</span>
                            <p>12 cards are displayed on the board.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-bold text-2xl">2.</span>
                            <p>Find 3 cards that form a SET by clicking on them.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-bold text-2xl">3.</span>
                            <p>If valid, you score points and new cards replace them.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-bold text-2xl">4.</span>
                            <p>If no SET exists, 3 more cards are added.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-bold text-2xl">5.</span>
                            <p>The player with the most points wins!</p>
                        </div>
                    </div>
                    <div className="bg-gold border-4 border-black p-4 mt-4">
                        <p className="font-bold text-black uppercase tracking-wider">
                            Ready to play? Click "Get Started" to create an account!
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    const currentStepData = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={currentStepData.title}
            type="white"
            closeOnBackdrop={false}
        >
            <div className="space-y-6">
                {currentStepData.content}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t-4 border-black">
                    <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={isFirstStep}
                        className={`px-6 py-3 border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold ${
                            isFirstStep
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-gold'
                        }`}
                    >
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-3 h-3 border-2 border-black ${
                                    index === currentStep
                                        ? 'bg-set-purple'
                                        : 'bg-white'
                                }`}
                            />
                        ))}
                    </div>

                    {isLastStep ? (
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-set-green hover:bg-[#008800] border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-white"
                            style={{ color: '#ffffff', backgroundColor: '#00AA00' }}
                        >
                            Got it!
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="px-6 py-3 bg-set-purple hover:bg-[#5500AA] border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-white"
                            style={{ color: '#ffffff', backgroundColor: '#6600CC' }}
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}

