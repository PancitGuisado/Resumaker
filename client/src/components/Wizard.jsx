import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, FastForward } from 'lucide-react';
import TalkingMascot from './TalkingMascot';
import '../styles/wizard.css';

const WIZARD_STEPS = [
  {
    id: 'name',
    question: "Let's build your resume. First, what is your full name?",
    placeholder: "e.g. John Doe",
    type: 'input'
  },
  {
    id: 'contact',
    question: "Nice to meet you! How can employers contact you? (Email, Phone, City)",
    placeholder: "e.g. john@email.com, 555-1234, New York",
    type: 'input'
  },
  {
    id: 'summary',
    question: "Tell me a little bit about yourself and your career goals. A short professional summary.",
    placeholder: "e.g. I am a passionate software engineer with 5 years of experience...",
    type: 'textarea'
  },
  {
    id: 'experience',
    question: "Time for the meat! What is your work experience? List your recent roles, companies, and what you did.",
    placeholder: "e.g. Senior Dev at TechCorp (2020-2023) - Lead a team of 5...",
    type: 'textarea'
  },
  {
    id: 'education',
    question: "Almost done! What about your education? (Degrees, universities, graduation years)",
    placeholder: "e.g. BS Computer Science, State University, 2019",
    type: 'textarea'
  },
  {
    id: 'skills',
    question: "Lastly, list your top skills. What are you best at? Just separate them by commas.",
    placeholder: "e.g. React, JavaScript, Project Management, SEO",
    type: 'input'
  }
];

export default function Wizard({ onComplete, disabled }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentStep = WIZARD_STEPS[stepIndex];

  const handleNext = () => {
    if (stepIndex < WIZARD_STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      // Compile prompt
      const compiledPrompt = `
      Name: ${answers.name || 'Not provided'}
      Contact Info: ${answers.contact || 'Not provided'}
      Summary: ${answers.summary || 'Not provided'}
      Experience: ${answers.experience || 'Not provided'}
      Education: ${answers.education || 'Not provided'}
      Skills: ${answers.skills || 'Not provided'}
      
      Please take the above information and format it into a professional, well-structured resume JSON object matching the schema.
      `;
      onComplete(compiledPrompt);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    const newAnswers = { ...answers, [currentStep.id]: '' };
    setAnswers(newAnswers);
    handleNext();
  };

  const handleChange = (e) => {
    setAnswers({ ...answers, [currentStep.id]: e.target.value });
  };

  const progressPercentage = ((stepIndex) / WIZARD_STEPS.length) * 100;

  return (
    <div className="wizard-container">
      {/* Progress Bar */}
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '2rem' }}>
        <div className="wizard-step-indicator">
          Step {stepIndex + 1} of {WIZARD_STEPS.length}: {currentStep.id.toUpperCase()}
        </div>
        <div className="wizard-progress-bar" style={{ marginTop: '0.5rem' }}>
          <div className="wizard-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <TalkingMascot text={currentStep.question}>
        <div className="wizard-input-area">
          {currentStep.type === 'textarea' ? (
            <textarea
              value={answers[currentStep.id] || ''}
              onChange={handleChange}
              placeholder={currentStep.placeholder}
              rows={4}
              disabled={disabled}
              className="wizard-textarea"
            />
          ) : (
            <input
              type="text"
              value={answers[currentStep.id] || ''}
              onChange={handleChange}
              placeholder={currentStep.placeholder}
              disabled={disabled}
              className="wizard-input"
            />
          )}
        </div>

        <div className="wizard-controls">
          <button onClick={handleBack} disabled={stepIndex === 0 || disabled} className="btn-retro btn-retro-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={handleSkip} disabled={disabled} className="btn-retro btn-retro-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FastForward size={18} /> Skip
          </button>
          <button 
            onClick={handleNext} 
            disabled={disabled || (!answers[currentStep.id] && stepIndex !== WIZARD_STEPS.length - 1)} 
            className="btn-retro btn-retro-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {stepIndex === WIZARD_STEPS.length - 1 ? <><Sparkles size={18} /> Generate Resume</> : <>Next <ArrowRight size={18} /></>}
          </button>
        </div>
      </TalkingMascot>
    </div>
  );
}
