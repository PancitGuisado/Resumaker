import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, FastForward } from 'lucide-react';
import TalkingMascot from './TalkingMascot';
import '../styles/wizard.css';

const FIELD_OPTIONS = [
  { id: 'it', label: 'IT / Computer Science', icon: '💻' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'business', label: 'Business / Marketing', icon: '📊' },
  { id: 'engineering', label: 'Engineering', icon: '⚙️' },
  { id: 'creative', label: 'Creative / Design', icon: '🎨' },
  { id: 'hospitality', label: 'Hospitality / Tourism', icon: '🏨' },
  { id: 'law', label: 'Law / Legal', icon: '⚖️' },
  { id: 'other', label: 'Other', icon: '📝' },
];

const FIELD_PLACEHOLDERS = {
  it: {
    summary: "e.g. I am a passionate software engineer with 5 years of experience in full-stack development...",
    experience: "e.g. Senior Dev at TechCorp (2020-2023) - Lead a team of 5, built REST APIs...",
    education: "e.g. BS Computer Science, State University, 2019",
    skills: "e.g. React, JavaScript, Python, Node.js, Git, AWS",
  },
  healthcare: {
    summary: "e.g. Compassionate registered nurse with 3 years of experience in critical care...",
    experience: "e.g. Staff Nurse at City Hospital (2021-2024) - Provided care for 10+ patients daily...",
    education: "e.g. BS Nursing, University of the Philippines, 2020",
    skills: "e.g. Patient Care, IV Therapy, Electronic Health Records, BLS/ACLS Certified",
  },
  education: {
    summary: "e.g. Enthusiastic educator with 4 years of experience in elementary education...",
    experience: "e.g. Grade 5 Teacher at Sunshine Elementary (2020-2024) - Taught Math & Science to 40+ students...",
    education: "e.g. Bachelor of Elementary Education, PNU, 2019",
    skills: "e.g. Classroom Management, Lesson Planning, Differentiated Instruction, Google Classroom",
  },
  business: {
    summary: "e.g. Results-driven marketing manager with 6 years of experience in digital strategy...",
    experience: "e.g. Marketing Manager at BrandCo (2019-2024) - Grew social media by 200%, managed $50K ad budget...",
    education: "e.g. MBA, Ateneo de Manila University, 2018",
    skills: "e.g. Digital Marketing, Financial Analysis, Excel, Salesforce, Leadership",
  },
  engineering: {
    summary: "e.g. Licensed civil engineer with 5 years of experience in structural design and construction...",
    experience: "e.g. Project Engineer at BuildRight Inc. (2019-2024) - Supervised 3 commercial building projects...",
    education: "e.g. BS Civil Engineering, UP Diliman, 2018",
    skills: "e.g. AutoCAD, Structural Analysis, Project Management, Quality Control",
  },
  creative: {
    summary: "e.g. Creative graphic designer with 4 years of experience in branding and UI/UX...",
    experience: "e.g. Lead Designer at PixelStudio (2020-2024) - Designed brand identities for 20+ clients...",
    education: "e.g. BFA Graphic Design, UST, 2019",
    skills: "e.g. Adobe Photoshop, Illustrator, Figma, Typography, Branding",
  },
  hospitality: {
    summary: "e.g. Experienced hotel front office manager with 5 years in luxury hospitality...",
    experience: "e.g. Front Office Manager at Grand Hotel (2019-2024) - Managed team of 15, maintained 95% guest satisfaction...",
    education: "e.g. BS Hotel & Restaurant Management, Lyceum, 2018",
    skills: "e.g. Guest Relations, Opera PMS, Event Coordination, Team Leadership",
  },
  law: {
    summary: "e.g. Detail-oriented paralegal with 3 years of experience in corporate law...",
    experience: "e.g. Paralegal at Smith & Associates (2021-2024) - Drafted contracts, conducted legal research...",
    education: "e.g. Juris Doctor, San Beda College of Law, 2020",
    skills: "e.g. Legal Research, Contract Drafting, Litigation Support, Westlaw",
  },
  other: {
    summary: "e.g. Tell us about yourself, your career goals, and what makes you stand out...",
    experience: "e.g. Your recent roles, companies, dates, and what you accomplished...",
    education: "e.g. Your degree, school name, and graduation year...",
    skills: "e.g. Your top skills, separated by commas...",
  },
};

function getSteps(selectedField) {
  const placeholders = FIELD_PLACEHOLDERS[selectedField] || FIELD_PLACEHOLDERS.other;
  return [
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
      placeholder: placeholders.summary,
      type: 'textarea'
    },
    {
      id: 'experience',
      question: "Time for the meat! What is your work experience? List your recent roles, companies, and what you did.",
      placeholder: placeholders.experience,
      type: 'textarea'
    },
    {
      id: 'education',
      question: "Almost done! What about your education? (Degrees, universities, graduation years)",
      placeholder: placeholders.education,
      type: 'textarea'
    },
    {
      id: 'skills',
      question: "Lastly, list your top skills. What are you best at? Just separate them by commas.",
      placeholder: placeholders.skills,
      type: 'input'
    }
  ];
}

export default function Wizard({ onComplete, disabled }) {
  const [selectedField, setSelectedField] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [rateLimitMessage, setRateLimitMessage] = useState(null);

  React.useEffect(() => {
    const DAILY_LIMIT = 2;
    const today = new Date().toISOString().slice(0, 10);
    const rateLimitData = JSON.parse(localStorage.getItem('resumaker_rate_limit') || '{}');
    
    if (rateLimitData.date === today && rateLimitData.count >= DAILY_LIMIT) {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow - now;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      let waitTimeStr = "";
      if (diffHrs > 0) {
        waitTimeStr = `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} and ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
      } else {
        waitTimeStr = `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
      }

      setRateLimitMessage(`Meow! You've used up your ${DAILY_LIMIT} AI generations for today. Please wait ${waitTimeStr} until I'm fully recharged!`);
    }
  }, []);

  if (rateLimitMessage) {
    return (
      <div className="wizard-container">
        <TalkingMascot text={rateLimitMessage}>
          {/* Empty body since they just need to read the message */}
        </TalkingMascot>
      </div>
    );
  }

  // Field selection screen
  if (!selectedField) {
    return (
      <div className="wizard-container">
        <TalkingMascot text="Welcome! Before we start, what field or industry is your resume for?">
          <div className="field-selection-grid">
            {FIELD_OPTIONS.map(field => (
              <button
                key={field.id}
                className="field-option-btn"
                onClick={() => setSelectedField(field.id)}
                disabled={disabled}
              >
                <span className="field-icon">{field.icon}</span>
                <span className="field-label">{field.label}</span>
              </button>
            ))}
          </div>
        </TalkingMascot>
      </div>
    );
  }

  const WIZARD_STEPS = getSteps(selectedField);
  const currentStep = WIZARD_STEPS[stepIndex];
  const fieldLabel = FIELD_OPTIONS.find(f => f.id === selectedField)?.label || selectedField;

  const handleNext = () => {
    if (stepIndex < WIZARD_STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      const compiledPrompt = `
      Field/Industry: ${fieldLabel}
      Name: ${answers.name || 'Not provided'}
      Contact Info: ${answers.contact || 'Not provided'}
      Summary: ${answers.summary || 'Not provided'}
      Experience: ${answers.experience || 'Not provided'}
      Education: ${answers.education || 'Not provided'}
      Skills: ${answers.skills || 'Not provided'}
      
      Please take the above information and format it into a professional, well-structured resume JSON object matching the schema. Tailor the language, tone, and formatting to be appropriate for the ${fieldLabel} industry.
      `;
      onComplete(compiledPrompt);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    } else {
      setSelectedField(null); // Go back to field selection
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
          <button onClick={handleBack} disabled={disabled} className="btn-retro btn-retro-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
