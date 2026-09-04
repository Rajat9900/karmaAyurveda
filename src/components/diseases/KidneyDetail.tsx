'use client';
import React from 'react';
import { 
  ArrowRight, 
  Check, 
  Activity, 
  Droplet, 
  Sparkles, 
  Wind, 
  AlertTriangle, 
  Info, 
  Heart,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export default function KidneyDetail() {
  const focusPoints = [
    'Personalized treatment plans: Customized based on your body constitution (Prakriti) and current GFR/creatinine levels.',
    'Ayurvedic herbal formulations: Safe, tested herbs like Punarnava, Varun, and Gokshur to rejuvenate nephrons.',
    'Diet and lifestyle guidance: Precision renal diet charts balancing sodium, potassium, and phosphorus intake.',
    'Regular follow-ups: Continuous monitoring of blood reports and GFR progression with clinical support.',
    'Supportive therapies: Detoxifying Panchakarma treatments like Basti to reduce load on kidneys.',
    'Patient education: Empowering you with daily habits, fluid management rules, and yoga routines.',
    'Long-term wellness: Aiming to restore kidney filters naturally and avoid dialysis or organ transplant.'
  ];

  const ckdStages = [
    {
      stage: 1,
      name: 'Stage 1',
      gfr: 'GFR 90+',
      status: 'Initial Damage & Risk Factors',
      desc: 'Kidneys are healthy but initial damage or high risk (e.g. from diabetes, hypertension).',
      color: 'border-emerald-200 bg-emerald-50/30'
    },
    {
      stage: 2,
      name: 'Stage 2',
      gfr: 'GFR 60-89',
      status: 'Progression & Decreased GFR',
      desc: 'Mild decline in GFR indicating early progression. Glomerular filtration rate begins to decrease.',
      color: 'border-green-200 bg-green-50/30'
    },
    {
      stage: 3,
      name: 'Stage 3',
      gfr: 'GFR 30-59',
      status: 'Moderate Function Decline',
      desc: 'Moderate kidney damage. Waste products start building up in the bloodstream.',
      color: 'border-amber-200 bg-amber-50/30'
    },
    {
      stage: 4,
      name: 'Stage 4-5',
      gfr: 'GFR <30 / <15',
      status: 'Severe Failure / ESRD',
      desc: 'Severe decline in filtering. Dialysis, transplant, or intensive Ayurvedic rejuvenation required.',
      color: 'border-rose-200 bg-rose-50/30'
    }
  ];

  const symptomsList = [
    {
      title: 'FATIGUE & WEAKNESS',
      desc: 'Constant feeling of being tired, lacking energy for daily tasks.',
      icon: Info,
      iconColor: 'text-amber-600 bg-amber-50'
    },
    {
      title: 'SWELLING (EDEMA)',
      desc: 'Puffy ankles, feet, or face due to fluid retention.',
      icon: Sparkles,
      iconColor: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'CHANGES IN URINATION',
      desc: 'Darker urine, foam/bubbles, more frequent or decreased urination.',
      icon: Droplet,
      iconColor: 'text-orange-600 bg-orange-50'
    },
    {
      title: 'ITCHY SKIN',
      desc: 'Persistent, severe itching due to waste buildup in the body.',
      icon: AlertTriangle,
      iconColor: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'SHORTNESS OF BREATH',
      desc: 'Feeling short of breath, especially with physical exertion (due to fluid/anemia).',
      icon: Wind,
      iconColor: 'text-teal-600 bg-teal-50'
    },
    {
      title: 'NAUSEA & VOMITING',
      desc: 'Poor appetite, ongoing nausea, feeling sick, and vomiting.',
      icon: Activity,
      iconColor: 'text-rose-600 bg-rose-50'
    }
  ];

  const bulletCauses = [
    'Uncontrolled diabetes can damage the tiny blood vessels of the kidneys over time.',
    'High blood pressure puts extra strain on the kidneys and affects their filtering ability.',
    'Frequent kidney infections or stones may gradually weaken kidney function.',
    'Poor lifestyle habits like smoking, an unhealthy diet, and low water intake can increase the risk of kidney damage.'
  ];

  const bulletSymptoms = [
    'Swelling in feet, ankles, or around the eyes due to fluid buildup.',
    'Frequent tiredness, weakness, and low energy levels.',
    'Changes in urination, such as foamy urine, frequent urination, or reduced urine output.',
    'Loss of appetite, nausea, and difficulty concentrating in advanced stages.'
  ];

  const causesList = [
    'Diabetes (High blood sugar damages blood vessels)',
    'High blood pressure (Strains kidney filters)',
    'Chronic kidney infections (Weakens kidney tissue)',
    'Polycystic kidney disease (Genetic cysts disrupt function)',
    'Recurrent kidney stones (Obstruction and damage)',
    'Autoimmune diseases (Lupus or IgA Nephropathy)',
    'Urinary tract obstruction (Blocks urine flow)',
    'Painkillers misuse (Long-term NSAIDs toxicity)',
    'Family history of kidney disease'
  ];

  const earlyAssessmentBenefits = [
    'Detect kidney disease sooner when it is most manageable',
    'Monitor creatinine and eGFR levels to track stability',
    'Identify underlying risk factors (diabetes, hypertension)',
    'Guide timely treatment decisions and avoid dialysis',
    'Reduce the risk of complications'
  ];

  // A helper component for sections with lines on both sides
  const DecoratedHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center gap-4 my-10">
      <div className="h-[1px] flex-1 bg-gray-200 max-w-[150px] md:max-w-[250px]"></div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center tracking-tight px-2">
        {children}
      </h2>
      <div className="h-[1px] flex-1 bg-gray-200 max-w-[150px] md:max-w-[250px]"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      
      {/* Intro Section */}
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
          Chronic Kidney Disease: Understanding Your Kidneys and How Ayurveda May Support Your Journey
        </h1>
        <div className="space-y-4 text-gray-600 leading-relaxed text-base">
          <p>
            When something goes wrong with your kidneys, life doesn't always hit the brakes overnight. 
            In fact, kidney problems are often like that quiet friend who doesn't complain until things get serious. 
            That's exactly why learning about chronic kidney disease and recognizing it early can make a real difference.
          </p>
          <p>
            At <strong className="text-green-800">Karma Ayurveda</strong>, we understand that living with kidney disease can feel overwhelming. 
            One day you're looking at routine blood test reports, and the next you're searching online for answers, 
            wondering whether you need a kidney specialist or even typing <span className="italic text-gray-800">"kidney doctor near me"</span> into your search bar at 2 a.m. 
            We've met countless people who've been there, and the first thing we tell them is this: you don't have to navigate this journey alone.
          </p>
          <p>
            For over eight decades, Karma Ayurveda has been dedicated to providing personalized Ayurvedic care for kidney health. 
            Our approach doesn't begin with medicines; it begins with listening. We take the time to understand your symptoms, 
            medical history, lifestyle, and overall well-being before creating an individualized plan. Many patients who visit us 
            are looking for kidney disease treatment that focuses not only on reports but also on improving their quality of life 
            through holistic care.
          </p>
          <p>
            If you've been exploring options like Ayurvedic kidney treatment or wondering whether traditional Ayurvedic care 
            can complement your existing treatment plan, this guide will help you understand our approach.
          </p>
        </div>
      </div>

      {/* About Karma Ayurveda Section */}
      <div className="space-y-4 border-t border-gray-100 pt-6">
        <h3 className="text-xl font-bold text-gray-800">About Karma Ayurveda</h3>
        <p className="text-gray-600 leading-relaxed">
          At Karma Ayurveda, every patient is treated as an <span className="font-semibold text-green-800 border-b border-rose-300">individual</span>, not just another medical file. 
          Our philosophy is simple: understand the person first, then the condition.
        </p>

        <div className="space-y-2 mt-4">
          <p className="font-semibold text-gray-800">Our care focuses on:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
            {focusPoints.map((point, idx) => (
              <li key={idx} className="flex gap-2 items-start text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-700 mt-1 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-gray-500 italic pt-2">
          Many people searching for Karma Ayurveda Ayurvedic kidney treatment hospital are looking for a place 
          where experienced Ayurvedic physicians take the time to understand their concerns. That's exactly 
          what we strive to offer every day.
        </p>
      </div>

      {/* Redesigned Section 1: What is CKD? (Light green card with dashed border) */}
      <div className="bg-[#f4f8f5] border border-dashed border-emerald-600 p-6 md:p-8 rounded-xl text-center shadow-xs">
        <h2 className="text-xl md:text-2xl font-bold text-[#1f4229] mb-3">
          What is Chronic Kidney Disease (CKD)?
        </h2>
        <p className="text-gray-700 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
          Chronic Kidney Disease (CKD) is a long-term condition where the kidneys gradually lose their 
          ability to filter waste and excess fluids from the blood. If not managed early, it can lead 
          to serious health complications and kidney failure.
        </p>
      </div>

      {/* Redesigned Section 2: How does CKD Develop? */}
      <div>
        <DecoratedHeading>How does Chronic Kidney Disease (CKD) Develop?</DecoratedHeading>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: List of causes/triggers */}
          <div className="lg:col-span-5 space-y-4">
            {bulletCauses.map((cause, idx) => (
              <div 
                key={idx} 
                className="bg-white p-4 rounded-xl border border-gray-100 flex gap-3.5 items-start"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1e462d] text-white flex items-center justify-center mt-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {cause}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: Flat Timeline Stepper */}
          <div className="lg:col-span-7 bg-[#f9fcf9] border border-green-50 rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              DEVELOPMENT OF CHRONIC KIDNEY DISEASE (CKD)
            </h4>

            {/* Grid of stages (flat layout, no interactivity) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ckdStages.map((stageItem) => (
                <div
                  key={stageItem.stage}
                  className={`p-3.5 rounded-lg border text-left bg-white ${stageItem.color}`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {stageItem.name}
                    </span>
                    <span className="text-xs font-bold text-gray-700">{stageItem.gfr}</span>
                  </div>
                  <h5 className="text-xs font-bold text-gray-800">{stageItem.status}</h5>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                    {stageItem.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Scale */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1">
                <span>HEALTHY KIDNEY</span>
                <span>SEVERE CKD</span>
              </div>
              <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500"></div>
              <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                <span>GFR &ge; 90</span>
                <span>GFR &lt; 15</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Causes Section */}
      <div className="space-y-4 border-t border-gray-100 pt-6">
        <h3 className="text-xl font-bold text-gray-800">What Causes Chronic Kidney Disease?</h3>
        <p className="text-gray-600 leading-relaxed text-sm">
          CKD doesn't usually develop because of one single reason. Instead, it's often the result of long-term damage to the kidneys. Common causes include:
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
          {causesList.map((cause, idx) => (
            <li key={idx} className="flex gap-2 items-start text-sm text-gray-600">
              <span className="text-green-700 font-bold mt-0.5">•</span>
              <span>{cause}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Redesigned Section 3: Symptoms of CKD */}
      <div>
        <DecoratedHeading>Symptoms of Chronic Kidney Disease (CKD)</DecoratedHeading>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Symptoms Indicator Display */}
          <div className="lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
            <div className="text-center pb-3 border-b border-gray-100 mb-4">
              <h5 className="text-sm font-bold text-gray-800">
                SYMPTOMS OF CHRONIC KIDNEY DISEASE (CKD)
              </h5>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Common Signs & Indicators</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {symptomsList.map((symptom, idx) => {
                const SymptomIcon = symptom.icon;
                return (
                  <div 
                    key={idx} 
                    className="p-3 rounded-lg border border-gray-100 bg-gray-50/30 flex gap-3 items-start"
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center mt-0.5 ${symptom.iconColor}`}>
                      <SymptomIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-gray-800">{symptom.title}</h6>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">{symptom.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: bullet cards list */}
          <div className="lg:col-span-5 space-y-4">
            {bulletSymptoms.map((symptom, idx) => (
              <div 
                key={idx} 
                className="bg-white p-4 rounded-xl border border-gray-100 flex gap-3.5 items-start"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1e462d] text-white flex items-center justify-center mt-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {symptom}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6 leading-relaxed italic bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
          If these symptoms persist, it's important to consult a healthcare professional instead of relying on internet searches alone. Whether you're looking for a kidney specialist near me or seeking an experienced kidney specialist hospital, getting evaluated early is always the better choice.
        </p>
      </div>

      {/* Redesigned Section 4: Why Early Assessment Matters */}
      <div className="border-t border-gray-100 pt-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Why Early Assessment Matters</h3>
        <p className="text-gray-600 leading-relaxed text-sm">
          Here's something many people don't realize: your kidneys can lose a significant amount of 
          function before obvious symptoms appear. That's why regular health check-ups are so valuable, 
          especially if you have diabetes, high blood pressure, obesity, or a family history of kidney disease.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {earlyAssessmentBenefits.map((benefit, idx) => (
            <div key={idx} className="flex gap-2.5 items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-50 text-green-700 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <p className="text-sm text-gray-600">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
