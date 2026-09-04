'use client';
import React, { useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import { Leaf, Sparkles, Activity, Sun, Play, ArrowRight } from 'lucide-react';

interface TherapyDetail {
  id: string;
  name: string;
  categoryName?: string;
  what: string;
  how: string;
  why: string;
  benefits: string;
  image: string;
  videoId?: string;
}

interface Category {
  title: string;
  subtitle: string;
  therapies: TherapyDetail[];
}

interface Pillar {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  image: string;
  description: string;
  categories: Category[];
}

const pillarDetails: Pillar[] = [
  {
    id: 'shodhan',
    number: '01',
    name: 'Shodhan',
    subtitle: 'Cleansing & Detoxification',
    badge: 'Therapies',
    icon: Sparkles,
    image: 'https://hiims.in/images-new/pillar1.webp',
    description: 'Shodhan focuses on eliminating deeply rooted toxins (Ama) and structural blockages from the body tissues to restore natural equilibrium.',
    categories: [
      {
        title: 'Panchakarma (Five Core Detox Actions)',
        subtitle: 'The ultimate Ayurvedic detoxification system to purge morbid doshas from the body.',
        therapies: [
          {
            id: 'vamana',
            name: 'Vamana',
            what: 'Vamana is a therapeutic process from Panchakarma that helps remove toxins from the internal upper body.',
            how: 'The process involves herbal preparations that gently induce vomiting to cleanse the digestive and thoracic tract.',
            why: 'It removes excess Kapha, mucus, and toxins accumulated in the stomach and chest, improving digestion and respiration.',
            benefits: 'Respiratory Relief, Digestive Improvement, Better Skin Health, Improved Mental Clarity, and Strong Immunity.',
            image: 'https://hiims.in/images-new/vamana.webp'
          },
          {
            id: 'virechana',
            name: 'Virechana',
            what: 'Virechana is a medicated purgation therapy that purifies the liver, gallbladder, and digestive tract.',
            how: 'Specialized herbal formulations are administered to flush out bile pigments and accumulated Pitta toxins through bowel evacuation.',
            why: 'It eliminates excess heat, acidity, and toxic bile buildup in the liver, blood vessels, and digestive organs.',
            benefits: 'Liver Detoxification, Natural Skin Glow, Relief from Acid Reflux, Metabolic Balance, and Improved Digestive Agni.',
            image: 'https://hiims.in/images-new/virechana.webp'
          },
          {
            id: 'basti',
            name: 'Basti',
            what: 'Basti is a medicated enema therapy considered the most effective Panchakarma treatment for Vata disorders.',
            how: 'Customized herbal oils and decoctions are introduced into the colon to purge toxins and nourish deep tissues.',
            why: 'It targets the colon—the primary seat of Vata—to eliminate stubborn systemic waste and joint stiffness.',
            benefits: 'Joint Pain Relief, Chronic Constipation Relief, Kidney & Colon Detoxification, Calm Nervous System.',
            image: 'https://hiims.in/images-new/basti.webp'
          },
          {
            id: 'nasya',
            name: 'Nasya',
            what: 'Nasya is the administration of medicated herbal drops or oils through the nasal passages.',
            how: 'After gentle facial steam and massage, herbal extracts are instilled into nostrils to reach cranial channels.',
            why: 'It clears head, sinus, and neck blockages, enhancing oxygen supply to brain cells and sensory organs.',
            benefits: 'Sinus & Migraine Relief, Enhanced Memory & Focus, Reduced Hair Fall, Clear Vision, Mental Calm.',
            image: 'https://hiims.in/images-new/nasya.webp'
          },
          {
            id: 'raktamokshana',
            name: 'Raktamokshana',
            what: 'Raktamokshana is a specialized blood-purification therapy using sterile medicinal leeches (Jalauka).',
            how: 'Medicinal leeches extract localized stagnant blood while releasing anti-inflammatory enzymes into micro-vessels.',
            why: 'It purges toxic blood (Rakta Dhatu) to rapidly reduce localized swelling, joint pain, and chronic skin lesions.',
            benefits: 'Psoriasis & Eczema Relief, Reduced Swelling, Varicose Vein Healing, Improved Micro-Circulation.',
            image: 'https://hiims.in/images-new/raktamokshana.webp'
          }
        ]
      },
      {
        title: 'Naturopathy Therapies',
        subtitle: 'Advanced nature-cure therapies to stimulate circulation, sweating, and organ recovery.',
        therapies: [
          {
            id: 'hwi',
            name: 'Hot Water Immersion (HWI)',
            what: 'Controlled thermal water bath therapy at 42°C engineered to reduce strain on kidneys and heart.',
            how: 'Warm water immersion creates hydrostatic pressure that redistributes blood volume and activates sweat pores.',
            why: 'It induces profuse sweating to excrete urea and creatinine through the skin, reducing renal workload.',
            benefits: 'Creatinine Reduction, Blood Pressure Regulation, Systemic Detox, Edema & Swelling Relief.',
            image: 'https://hiims.in/images-new/hot-water-therapy.webp'
          },
          {
            id: 'gravity',
            name: 'Gravity As Medicine (Gradient Therapy)',
            what: 'Postural positioning therapy utilizing Earth gravity to redirect blood flow to vital organs.',
            how: 'A 10° head-down tilt position shifts blood from lower extremities toward the torso, heart, and kidneys.',
            why: 'Increases renal blood flow and Glomerular Filtration Rate (GFR) naturally without chemical drugs.',
            benefits: 'Improved GFR Score, Enhanced Kidney Perfusion, Reduced Leg Swelling, Controlled BP.',
            image: 'https://hiims.in/images-new/gravity-as-medicine.webp'
          },
          {
            id: 'zero-volt',
            name: 'Zero-Volt Earthing / Grounding',
            what: 'Direct physical connection between the human body and the Earth’s natural electric field.',
            how: 'Patients rest on conductive grounding sheets connected directly to a copper Earth grounding rod.',
            why: 'Earth free electrons neutralize positively charged free radicals and systemic tissue inflammation.',
            benefits: 'Reduced Chronic Inflammation, Deep Sleep Restoration, Normal Blood Viscosity, Rapid Recovery.',
            image: 'https://hiims.in/images-new/zero-volt-therapy.webp'
          }
        ]
      }
    ]
  },
  {
    id: 'aahar',
    number: '02',
    name: 'Aahar',
    subtitle: 'Healing Through Food',
    badge: 'Nutrition',
    icon: Leaf,
    image: 'https://hiims.in/images-new/pillar4.webp',
    description: 'Food is considered the primary medicine in Ayurveda. Aahar corrects Agni (digestive fire) and feeds cellular regeneration.',
    categories: [
      {
        title: 'Dietary & Cellular Cleanse',
        subtitle: 'Customized living food plans designed to alkalize and repair the internal environment.',
        therapies: [
          {
            id: 'dip-diet',
            name: 'DIP & pH-Balanced Living Diet',
            what: 'A structured nutritional protocol centered around raw living fruits, seasonal greens, and plant-based foods.',
            how: 'Consuming high-water content raw foods in specific ratios optimizes stomach acid and systemic pH levels.',
            why: 'Replaces processed acidic waste with living enzymes, unburdening digestive and excretory organs.',
            benefits: 'Natural Blood Sugar Control, Reversed Acidity, High Energy Levels, Gut Microbiome Repair.',
            image: 'https://hiims.in/images-new/pillar4.webp'
          },
          {
            id: 'fasting',
            name: 'Autophagy & Intermittent Fasting',
            what: 'Regulated eating windows that activate the body’s innate self-cleansing mechanisms.',
            how: 'Fasting for 14-16 hours prompts white blood cells to recycle damaged cellular organelles and protein buildup.',
            why: 'Triggers cellular autophagy, allowing damaged tissues in kidneys and liver to repair naturally.',
            benefits: 'Cellular Renewal, Reduced Insulin Resistance, Autophagy Activation, Weight Management.',
            image: 'https://hiims.in/images-new/pillar4.webp'
          }
        ]
      }
    ]
  },
  {
    id: 'vihar',
    number: '03',
    name: 'Vihar',
    subtitle: 'Lifestyle & Mind-Body Sync',
    badge: 'Lifestyle',
    icon: Sun,
    image: 'https://hiims.in/images-new/pillar3.webp',
    description: 'Aligning daily habits with biological circadian rhythms to manage stress, balance hormones, and sustain vitality.',
    categories: [
      {
        title: 'Circadian Alignment & Yoga',
        subtitle: 'Integrating mental peace and physical movement for complete organ rejuvenation.',
        therapies: [
          {
            id: 'sunlight-grounding',
            name: 'Sunlight Therapy & Morning Routine',
            what: 'Direct morning sun exposure and barefoot nature walking to sync biological rhythms.',
            how: 'Morning infrared and UV light stimulates pineal gland melatonin synthesis and Vitamin D production.',
            why: 'Restores natural sleep-wake cycles, balances cortisol, and reduces systemic oxidative stress.',
            benefits: 'Improved Sleep Quality, Balanced Hormones, Stronger Immunity, Elevated Mood.',
            image: 'https://hiims.in/images-new/pillar3.webp'
          },
          {
            id: 'yoga-pranayama',
            name: 'Therapeutic Yoga & Pranayama',
            what: 'Targeted organ-specific asanas and deep oxygenation breathing exercises.',
            how: 'Pranayama routines increase cellular oxygenation while gentle postures massage internal organs.',
            why: 'Stimulates parasympathetic nervous system, lowering blood pressure and enhancing kidney circulation.',
            benefits: 'Enhanced Oxygenation, Lower Stress Hormones, Organ Massaging, Improved Flexibility.',
            image: 'https://hiims.in/images-new/pillar3.webp'
          }
        ]
      }
    ]
  },
  {
    id: 'shaman',
    number: '04',
    name: 'Shaman',
    subtitle: 'Herbal Rejuvenation & Healing',
    badge: 'Medicines',
    icon: Activity,
    image: 'https://hiims.in/images-new/pillar2.webp',
    description: 'Using specialized Ayurvedic herbs and Rasayana remedies to soothe aggravated doshas and strengthen organ vitality.',
    categories: [
      {
        title: 'Botanical Formulations',
        subtitle: 'Pure, standardized herbal preparations targeting root-cause disease reversal.',
        therapies: [
          {
            id: 'ayurvedic-herbs',
            name: 'Customized Kidney & Liver Herbs',
            what: 'Pure botanical formulations containing Punarnava, Gokshura, Varun, and Guduchi.',
            how: 'Bioactive herbal compounds reduce cellular inflammation and promote nephron and hepatocyte regeneration.',
            why: 'Targets the root cause of organ decline without synthetic chemicals or toxic side effects.',
            benefits: 'Creatinine Control, Liver Enzyme Normalization, Kidney Tissue Repair, Natural Detox.',
            image: 'https://hiims.in/images-new/pillar2.webp'
          },
          {
            id: 'rasayana',
            name: 'Rasayana Therapy (Tissue Rejuvenation)',
            what: 'Nourishing herbal remedies that rebuild body tissues (Dhatus) and immunity.',
            how: 'Potent Rasayana preparations fortify cellular membranes and improve nutrient absorption.',
            why: 'Prevents disease recurrence and builds long-term vitality in patients recovering from chronic illness.',
            benefits: 'Relapse Prevention, Enhanced Immunity, Youthful Vitality, Stronger Metabolism.',
            image: 'https://hiims.in/images-new/pillar2.webp'
          }
        ]
      }
    ]
  }
];

export default function PillarsSection() {
  const [activeTab, setActiveTab] = useState('shodhan');
  const currentPillar = pillarDetails.find(p => p.id === activeTab) || pillarDetails[0];

  return (
    <section className="py-20 bg-gradient-to-b from-[#f7faf8] via-white to-green-50/40 relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-green-200/25 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        <SectionHeading 
          title="How We Reverse Diseases" 
          subtitle="In Ayurveda, research is built around four fundamental pillars - Shodhan (Therapies), Aahar (Food), Vihar (Lifestyle), and Shaman (Medicines)."
        />

        {/* 4 Pillars Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-14">
          {pillarDetails.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = activeTab === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveTab(pillar.id)}
                className={`flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 text-center relative overflow-hidden ${
                  isActive 
                    ? 'bg-[#1f4229] text-white border-[#1f4229] shadow-xl scale-[1.02]' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50/50 shadow-sm'
                }`}
              >
                <span className={`text-xs font-extrabold px-3 py-0.5 rounded-full mb-3 ${
                  isActive ? 'bg-[#ef8716] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  Pillar {pillar.number}
                </span>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isActive ? 'bg-white/10 text-yellow-400' : 'bg-green-50 text-[#1f4229]'
                }`}>
                  <Icon size={24} />
                </div>

                <h3 className="font-extrabold text-lg md:text-xl leading-tight">
                  {pillar.name}
                </h3>
                <p className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-green-100' : 'text-gray-500'
                }`}>
                  ({pillar.badge})
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Details */}
        <div className="space-y-16">
          {currentPillar.categories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-10">
              
              {/* Category Header */}
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-xs font-extrabold text-[#ef8716] uppercase tracking-widest bg-orange-50 px-4 py-1 rounded-full border border-orange-100">
                  {currentPillar.name} Protocol
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#1f4229] mt-3">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                  {category.subtitle}
                </p>
              </div>

              {/* Therapy Cards (Matching the user screenshot format) */}
              <div className="space-y-12">
                {category.therapies.map((therapy) => (
                  <div 
                    key={therapy.id}
                    className="bg-[#f3f9f4] p-6 md:p-8 rounded-3xl border border-[#d8eae0] shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 relative"
                  >
                    
                    {/* Header Divider with Therapy Name */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                      <div className="h-[2px] bg-[#1f4229]/20 flex-1 max-w-[200px]" />
                      <h4 className="text-2xl md:text-3xl font-extrabold text-[#1f4229] tracking-tight text-center">
                        {therapy.name}
                      </h4>
                      <div className="h-[2px] bg-[#1f4229]/20 flex-1 max-w-[200px]" />
                    </div>

                    {/* 2-Column Content Grid: Bullet Info Cards Left, Video/Image Right */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                      
                      {/* Left Side: 4 Info Boxes + Button */}
                      <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                        
                        {/* What Is This Therapy */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:border-green-200 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-[#1f4229] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-xs font-bold">➔</span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-gray-900 text-sm md:text-base mb-0.5">
                              What Is This Therapy
                            </h5>
                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                              {therapy.what}
                            </p>
                          </div>
                        </div>

                        {/* How It Works */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:border-green-200 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-[#1f4229] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-xs font-bold">➔</span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-gray-900 text-sm md:text-base mb-0.5">
                              How It Works
                            </h5>
                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                              {therapy.how}
                            </p>
                          </div>
                        </div>

                        {/* Why This Therapy */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:border-green-200 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-[#1f4229] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-xs font-bold">➔</span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-gray-900 text-sm md:text-base mb-0.5">
                              Why This Therapy
                            </h5>
                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                              {therapy.why}
                            </p>
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:border-green-200 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-[#1f4229] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-xs font-bold">➔</span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-gray-900 text-sm md:text-base mb-0.5">
                              Benefits
                            </h5>
                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                              {therapy.benefits}
                            </p>
                          </div>
                        </div>

                        {/* Read More Button */}
                        <div className="pt-2">
                          <a 
                            href="/all-diseases"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1f4229] hover:bg-[#152e1c] text-white text-sm font-bold rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                          >
                            Read More <ArrowRight size={16} />
                          </a>
                        </div>

                      </div>

                      {/* Right Side: Image with Watch Video Button Overlay (Matches screenshot) */}
                      <div className="lg:col-span-5 flex flex-col">
                        <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white flex flex-col h-full bg-white group/vid relative">
                          
                          {/* Image Container */}
                          <div className="relative flex-1 min-h-[300px] lg:min-h-full overflow-hidden bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={therapy.image} 
                              alt={therapy.name} 
                              className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover/vid:bg-black/20 transition-colors" />
                          </div>

                          {/* Watch Video Red Button Overlay at Bottom */}
                          <a 
                            href="https://www.youtube.com/karmaayurveda" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-[#fc4444] hover:bg-[#e03333] text-white py-3.5 px-4 font-extrabold text-center text-sm md:text-base flex items-center justify-center gap-2 transition-colors shadow-inner w-full"
                          >
                            <div className="w-7 h-7 rounded-full bg-white text-[#fc4444] flex items-center justify-center shadow-sm">
                              <Play size={14} fill="currentColor" className="ml-0.5" />
                            </div>
                            Watch Video
                          </a>

                        </div>
                      </div>

                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
