'use client';

import React, { useState } from 'react';
import { Disease } from '@/app/actions/diseaseActions';
import { Pillar } from '@/app/actions/pillarActions';
import { DiseaseTreatment } from '@/app/actions/diseaseTreatmentActions';
import { ServiceLocation } from '@/app/actions/locationActions';
import PillarsSection from '@/components/diseases/PillarsSection';
import DiseaseFaqSection from '@/components/diseases/DiseaseFaqSection';
import AboutDoctorSection from '@/components/home/AboutDoctorSection';
import ClinicsSection from '@/components/home/ClinicsSection';
import { 
  Play, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Stethoscope, 
  Phone, 
  Award,
  ShieldAlert,
  ArrowUpRight,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

interface Testimonial {
  caption: string;
  patientName: string;
  comparisonImg: string;
  videoId: string;
  duration: string;
}

interface DiseaseData {
  title: string;
  subtitle: string;
  whatIsTitle: string;
  bullets: string[];
  mainImage: string;
  testimonials: Testimonial[];
  treatmentFocus: { title: string; desc: string }[];
}

const defaultDiseases: Record<string, DiseaseData> = {
  cancer: {
    title: 'Ayurvedic Cancer Care',
    subtitle: 'Supportive and Integrative Ayurvedic Care for Cellular Recovery & Dosha Balance',
    whatIsTitle: 'What Is Cancer?',
    bullets: [
      'Cancer is a life-threatening disease caused by the uncontrolled growth and spread of abnormal cells.',
      'Normally, body cells divide, grow, and die in a regular cycle.',
      'When this process is disturbed, cells begin to multiply uncontrollably.',
      'These abnormal cells gather in one area, forming cysts or tumors.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=800&q=80',
    testimonials: [
      {
        caption: 'Mouth Cancer',
        patientName: 'Rajesh Kumar',
        comparisonImg: '/images/mouth_cancer_before_after.png',
        videoId: 'igRAgRP9KvM',
        duration: '4:15'
      },
      {
        caption: 'Blood Cancer',
        patientName: 'Meena Sharma',
        comparisonImg: '/images/blood_cancer_before_after.png',
        videoId: 'b1-TE2uzmos',
        duration: '5:20'
      }
    ],
    treatmentFocus: [
      { title: 'Immunity Boosting', desc: 'Rasayana therapies to enhance natural defense and combat toxins (Ama).' },
      { title: 'Side-Effect Mitigation', desc: 'Easing the fatigue and physical strain of conventional treatments.' },
      { title: 'Dosha Harmonization', desc: 'Targeted herbal formulas to calm highly aggravated Vata and Pitta.' },
      { title: 'Cellular Restoration', desc: 'Herbs like Tulsi, Ashwagandha, and Turmeric to support cellular repair.' }
    ]
  },
  kidney: {
    title: 'Kidney Disease Treatment',
    subtitle: 'Comprehensive Ayurvedic Care to Rejuvenate Nephrons & Restrict Dialysis Need',
    whatIsTitle: 'What Is Kidney Disease?',
    bullets: [
      'Kidneys filter extra water and waste products out of your blood 24 hours a day.',
      'When kidney function declines, these toxic wastes start building up in the bloodstream.',
      'Early stage kidney damage often has no obvious symptoms, making it hard to detect.',
      'Ayurvedic care focuses on naturally rejuvenating nephrons to restore filtration capacity.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    testimonials: [
      {
        caption: 'Kidney Failure',
        patientName: 'Harish Sharma',
        comparisonImg: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80',
        videoId: 'b1-TE2uzmos',
        duration: '6:20'
      },
      {
        caption: 'Chronic Kidney Disease',
        patientName: 'Asha Devi',
        comparisonImg: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
        videoId: 'IdSQ2EcJnxE',
        duration: '4:45'
      }
    ],
    treatmentFocus: [
      { title: 'Creatinine Management', desc: 'Using Mutral (diuretic) herbs like Gokshur and Varun to lower urea & creatinine.' },
      { title: 'Nephron Rejuvenation', desc: 'Rasayana herbs like Punarnava to revive damaged kidney filtration units.' },
      { title: 'GFR Correction', desc: 'Ayurvedic formulations aimed at progressively improving the Glomerular Filtration Rate.' },
      { title: 'Strict Fluid Regimen', desc: 'Precision fluid guidelines combined with custom sodium-potassium charts.' }
    ]
  },
  liver: {
    title: 'Liver Cirrhosis & Fatty Liver Care',
    subtitle: 'Natural Ayurvedic Detoxification & Cellular Rejuvenation for Liver Pathologies',
    whatIsTitle: 'What Is Liver Disease?',
    bullets: [
      'The liver processes everything you eat and drink, filtering out harmful toxins.',
      'Fat accumulation or chronic inflammation can damage liver tissues over time.',
      'Damaged liver cells are replaced by scar tissue, leading to liver cirrhosis.',
      'Natural therapies help detoxify liver cells and restore healthy metabolic enzyme levels.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80',
    testimonials: [
      {
        caption: 'Liver Cirrhosis',
        patientName: 'Amit Patel',
        comparisonImg: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
        videoId: 'IdSQ2EcJnxE',
        duration: '5:10'
      },
      {
        caption: 'Fatty Liver Reversal',
        patientName: 'Vikram Malhotra',
        comparisonImg: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80',
        videoId: 'igRAgRP9KvM',
        duration: '3:40'
      }
    ],
    treatmentFocus: [
      { title: 'Bile Regulation', desc: 'Balancing Ranjaka Pitta to optimize liver secretions and enzyme profiles.' },
      { title: 'Hepatocyte Protection', desc: 'Using Katuki and Bhumi Amla to reduce liver inflammation & scarring.' },
      { title: 'Toxin Flush (Ama)', desc: 'Gentle colon cleanses and herbal combinations to flush out stored liver toxins.' },
      { title: 'Metabolism Boost', desc: 'Strengthening the digestive fire (Jatharagni) to prevent future fatty deposits.' }
    ]
  },
  psoriasis: {
    title: 'Psoriasis & Skin Treatment',
    subtitle: 'Holistic Blood Purification and Dosha Management for Lasting Skin Health',
    whatIsTitle: 'What Is Psoriasis?',
    bullets: [
      'Psoriasis is a chronic skin disorder that causes cells to build up rapidly on the skin\'s surface.',
      'This rapid growth leads to thick, red, scaly patches that can itch or feel painful.',
      'In Ayurveda, skin issues are treated by purifying the blood (Rakta Shodhana) and balancing doshas.',
      'Addressing the root cause helps soothe inflammation and keep skin clear long-term.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    testimonials: [
      {
        caption: 'Plaque Psoriasis Reversal',
        patientName: 'Sanjay Verma',
        comparisonImg: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
        videoId: 'igRAgRP9KvM',
        duration: '4:05'
      },
      {
        caption: 'Scalp Psoriasis Recovery',
        patientName: 'Rekha Joshi',
        comparisonImg: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
        videoId: 'b1-TE2uzmos',
        duration: '3:50'
      }
    ],
    treatmentFocus: [
      { title: 'Blood Detox (Rakta)', desc: 'Blood-purifying herbs like Neem, Manjistha, and Khadir to soothe skin scaling.' },
      { title: 'Vata-Kapha Pacification', desc: 'Balancing the specific doshas responsible for dryness, itching, and plaque formation.' },
      { title: 'Soothing Topical Oils', desc: 'Psoria-protective Ayurvedic medicated oils to moisturize and restore skin layers.' },
      { title: 'Gut-Skin Axis Balance', desc: 'Improving digestional absorption to stop the accumulation of skin-damaging toxins (Visha).' }
    ]
  },
  parkinson: {
    title: 'Parkinson\'s & Neurological Care',
    subtitle: 'Vata Pacifying and Neuro-Protective Ayurvedic Therapies for Balance & Strength',
    whatIsTitle: 'What Is Parkinson\'s?',
    bullets: [
      'Parkinson\'s is a progressive nervous system disorder that primarily affects physical movement.',
      'It develops due to the gradual breakdown and loss of dopamine-producing brain cells.',
      'Common signs include hand tremors, limb stiffness, and slow physical movement.',
      'Ayurvedic neuro-protective therapies focus on pacifying Vata dosha to support nerve health.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
    testimonials: [
      {
        caption: 'Tremor Management',
        patientName: 'Gopal Prasad',
        comparisonImg: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
        videoId: 'IdSQ2EcJnxE',
        duration: '5:30'
      },
      {
        caption: 'Mobility Support',
        patientName: 'Sushma Swaraj',
        comparisonImg: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80',
        videoId: 'igRAgRP9KvM',
        duration: '4:20'
      }
    ],
    treatmentFocus: [
      { title: 'Vata Control (Kampa Vata)', desc: 'Warm, grounding therapies and herbal oils to calm the nervous system (Majja Dhatu).' },
      { title: 'Natural L-Dopa Herbs', desc: 'Utilizing Kapikachhu and Ashwagandha to naturally feed and protect neural pathways.' },
      { title: 'Panchakarma (Basti/Nasya)', desc: 'Specialized cleansing enemas and nasal drops to ground hyperactive neural energies.' },
      { title: 'Balance Restoration', desc: 'Gentle motor exercises and customized herbal powders to regain coordination.' }
    ]
  },
  diabetes: {
    title: 'Diabetes Reversal & Management',
    subtitle: 'Correcting Liver & Pancreatic Metabolism (Agni) to Restore Insulin Sensitivity',
    whatIsTitle: 'What Is Diabetes?',
    bullets: [
      'Diabetes is a metabolic condition that affects how your body turns food into energy.',
      'Insulin resistance prevents cells from absorbing glucose, leading to high blood sugar.',
      'Uncontrolled diabetes can damage blood vessels, nerves, kidneys, and other vital organs.',
      'Holistic Ayurvedic care targets metabolic correction to restore natural insulin sensitivity.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80',
    testimonials: [
      {
        caption: 'Blood Sugar Reversal',
        patientName: 'Vijay Yadav',
        comparisonImg: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80',
        videoId: 'b1-TE2uzmos',
        duration: '4:50'
      },
      {
        caption: 'Insulin-Free Life',
        patientName: 'Sunita Gupta',
        comparisonImg: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
        videoId: 'IdSQ2EcJnxE',
        duration: '5:05'
      }
    ],
    treatmentFocus: [
      { title: 'Pancreatic Health', desc: 'Bitter herbs like Gudmar, Karela, and Methi to trigger beta-cell secretions.' },
      { title: 'Digestive Correction', desc: 'Strengthening the metabolic fire to digest excess sugar and prevent toxin (Ama) accumulation.' },
      { title: 'Neuropathy Defense', desc: 'Nerve-strengthening Rasayana blends to avoid diabetic complications.' },
      { title: 'Ayurvedic Diet Chart', desc: 'Strict customized carbohydrate limits combined with detoxifying raw fiber plans.' }
    ]
  },
  arthritis: {
    title: 'Arthritis & Joint Care',
    subtitle: 'Grounding Excess Vata and Flushing Gut Toxins (Ama) from Joint Cavities',
    whatIsTitle: 'What Is Arthritis?',
    bullets: [
      'Arthritis is a common disorder causing painful inflammation and stiffness in joints.',
      'It can occur due to cartilage wear-and-tear or auto-immune response (Rheumatoid).',
      'Toxins (Ama) accumulating in the joints can worsen inflammation and reduce flexibility.',
      'Warm herbal oil therapies and lifestyle management help soothe joints and restore mobility.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    testimonials: [
      {
        caption: 'Rheumatoid Arthritis Care',
        patientName: 'Kailash Chand',
        comparisonImg: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
        videoId: 'IdSQ2EcJnxE',
        duration: '6:10'
      },
      {
        caption: 'Osteoarthritis Mobility',
        patientName: 'Kamlesh Devi',
        comparisonImg: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
        videoId: 'igRAgRP9KvM',
        duration: '4:30'
      }
    ],
    treatmentFocus: [
      { title: 'Ama Digestives (Deepan-Pachan)', desc: 'Using spices and herbs like Guggulu and Ginger to dissolve gut toxins before they travel to joints.' },
      { title: 'Vata Pacifying Massages', desc: 'Snehana (warm oil lubrication) with specialized oils like Mahanarayan Taila.' },
      { title: 'Anti-Inflammatory Herbs', desc: 'Shallaki, Ashwagandha, and Turmeric to soothe joint swelling and restore ease of movement.' },
      { title: 'Gentle Joint Sukshma Vyayama', desc: 'Micro-movements and guided postures to retain cartilage spacing and avoid stiffness.' }
    ]
  },
  asthma: {
    title: 'Asthma & Respiratory Care',
    subtitle: 'Clearing Kapha Congestion and Rebuilding Lung Tissue Immunity Naturally',
    whatIsTitle: 'What Is Asthma?',
    bullets: [
      'Asthma is a chronic condition that inflames and narrows the lungs\' airways.',
      'This narrowing causes periods of wheezing, chest tightness, and shortness of breath.',
      'Allergens, pollution, and Kapha dosha congestion in the chest are common triggers.',
      'Treatments aim to clear respiratory pathways, reduce airway sensitivity, and boost immunity.'
    ],
    mainImage: 'https://images.unsplash.com/photo-1628863012283-7472be757cef?auto=format&fit=crop&w=800&q=80',
    testimonials: [
      {
        caption: 'Inhaler-Free Life',
        patientName: 'Rajeev Saxena',
        comparisonImg: 'https://images.unsplash.com/photo-1628863012283-7472be757cef?auto=format&fit=crop&w=600&q=80',
        videoId: 'igRAgRP9KvM',
        duration: '4:00'
      },
      {
        caption: 'Allergic Asthma Control',
        patientName: 'Anjali Mehta',
        comparisonImg: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
        videoId: 'b1-TE2uzmos',
        duration: '5:12'
      }
    ],
    treatmentFocus: [
      { title: 'Bronchodilation', desc: 'Using Vasaka (Adhatoda vasica) and Pippali to relax air passages and thin Kapha mucus.' },
      { title: 'Pranavaha Srotas Cleansing', desc: 'Ayurvedic herbs and hot steam therapy to decongest bronchioles and alleviate cough.' },
      { title: 'Immunity Rebuilding', desc: 'Strengthening lung tissues using Rasayanas like Chitrabhadi and Haridrakhanda.' },
      { title: 'Pranayama Guidance', desc: 'Targeted breathing protocols to expand overall tidal capacity and lung durability.' }
    ]
  }
};

interface DiseaseDetailClientProps {
  disease: Disease;
  pillars: Pillar[];
  treatments: DiseaseTreatment[];
  locations?: ServiceLocation[];
}

export default function DiseaseDetailClient({ disease, pillars, treatments, locations = [] }: DiseaseDetailClientProps) {
  let bulletsArray: string[] = [];
  let focusArray: { title: string; desc: string }[] = [];
  let testimonialsArray: Testimonial[] = [];

  try {
    bulletsArray = JSON.parse(disease.bullets);
  } catch (e) {
    console.error('Failed to parse bullets:', e);
  }

  try {
    focusArray = JSON.parse(disease.treatment_focus);
  } catch (e) {
    console.error('Failed to parse treatment focus:', e);
  }

  try {
    testimonialsArray = JSON.parse(disease.testimonials);
  } catch (e) {
    console.error('Failed to parse testimonials:', e);
  }

  const data = {
    title: disease.title,
    subtitle: disease.subtitle,
    whatIsTitle: disease.what_is_title,
    bullets: bulletsArray,
    mainImage: disease.main_image,
    treatments,
    content: disease.content && disease.content !== '<p><br></p>' ? disease.content : '',
    testimonials: testimonialsArray,
    treatmentFocus: focusArray
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState('');

  const openVideo = (videoId: string) => {
    setSelectedVideo(videoId);
    setModalOpen(true);
  };

  return (
    <div className="bg-[#fcfdfc] text-gray-800 pb-0">
      
      {/* Testimonials Section (First Show Up) */}
      <section className="py-16 bg-gradient-to-b from-[#f3f9f4] to-[#fcfdfc]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <span className="inline-block py-1.5 px-4 rounded-full bg-white text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
              SUCCESS STORIES
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#152e1c] tracking-tight mb-3">
              {data.title.replace('Treatment', '').replace('Care', '')} Reversal Success Stories
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base font-medium">
              Real video testimonials showing clinical outcomes before and after Ayurvedic care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto justify-center">
            {data.testimonials.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => openVideo(item.videoId)}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-green-200 transition-all duration-300 group cursor-pointer flex flex-col hover:shadow-xl hover:-translate-y-1"
              >
                {/* Image display */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.comparisonImg} 
                    alt={item.caption}
                    className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
                  />
                  
                  {/* Before / After labels if matching cancer generated images */}
                  {item.comparisonImg.includes('before_after') && (
                    <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
                      <span className="bg-red-600/90 text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded shadow-sm uppercase">Before</span>
                      <span className="bg-[#1f4229]/90 text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded shadow-sm uppercase">After</span>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.duration}
                  </div>
                </div>

                {/* Caption bar */}
                <div className="p-4 text-center border-t border-gray-50 flex-grow flex flex-col justify-center">
                  <span className="text-[#d2621a] text-xs font-bold uppercase tracking-wider mb-1 block">Patient Success Story</span>
                  <h3 className="font-extrabold text-lg text-gray-800 leading-tight">
                    {item.caption} Case ({item.patientName})
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width Disease Overview Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="space-y-8 bg-white border border-gray-100/80 rounded-3xl p-6 md:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.015)]">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex flex-col sm:flex-row items-center gap-3">
                <span className="p-2 rounded-xl bg-green-50 text-[#1f4229] flex-shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </span>
                {data.whatIsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: 4 Bullet Points */}
              <div className="md:col-span-7 space-y-4 flex flex-col justify-center">
                {data.bullets.map((bullet, idx) => (
                  <div 
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-green-100 shadow-sm hover:shadow transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#165a31] text-white flex items-center justify-center mt-0.5 shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 leading-relaxed self-center">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Column: Custom Clinical Illustration */}
              <div className="md:col-span-5 relative group min-h-[250px]">
                <div className="absolute inset-0 bg-[#1f4229] rounded-2xl transform rotate-2 group-hover:rotate-1 transition-transform duration-300 shadow-md"></div>
                <div className="absolute inset-0 bg-white rounded-2xl overflow-hidden border border-gray-100 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300 shadow-md flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={data.mainImage} 
                    alt="Clinical care illustration" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
        <AboutDoctorSection/>
      {/* Main Grid Content Section (What Is, Bullets, Sidebar Form) */}
        <PillarsSection pillars={pillars} />
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col gap-12 items-start">
            
            {/* Left Content Area */}
            <div className="w-full space-y-12">
              
              {/* Treatment Focus Section */}
              <div className="space-y-6 rounded-[30px] border border-[#edf2ed] bg-white p-6 shadow-[0_10px_35px_rgba(17,45,29,0.04)] md:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebf7ee] text-[#1f4229] shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6b7c72]">Therapy Plan</p>
                    <h3 className="text-2xl font-black text-[#112d1d] md:text-3xl">Our Treatment Focus</h3>
                  </div>
                </div>

                <p className="max-w-3xl text-sm leading-7 text-[#4d5f57] md:text-base">
                  At Karma Ayurveda, we do not simply prescribe herbs to mask symptoms. We study your body constitution (Prakriti), analyze GFR/enzymatic trends, and restore metabolic balances at the cellular level:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {data.treatmentFocus.map((focus, idx) => (
                    <div
                      key={idx}
                      className="group rounded-[24px] border border-[#edf2ed] bg-gradient-to-br from-[#ffffff] to-[#f8fbf9] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#cfe7d5] hover:shadow-[0_16px_36px_rgba(17,45,29,0.08)]"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f4229] text-sm font-black text-white shadow-md shadow-[#1f4229]/20">
                          {idx + 1}
                        </div>
                        <h4 className="text-base font-black text-[#1a2e3b] md:text-lg">{focus.title}</h4>
                      </div>

                      <p className="text-sm leading-7 text-[#536760]">{focus.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence / Trust block */}
              <div className="bg-gradient-to-br from-[#1e462d] to-[#122e1d] text-white p-8 rounded-3xl relative overflow-hidden shadow-lg">
                <div className="relative z-10 space-y-5 max-w-xl">
                  <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">Why Hundreds of Thousands Choose Karma Ayurveda</h3>
                  <p className="text-xs md:text-sm text-green-100/90 leading-relaxed">
                    With a legacy since 1937, our physicians harness pure, tested herbal extracts and custom Panchakarma regimens to provide holistic care for chronic conditions.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm font-semibold">
                    {[
                      { icon: ShieldCheck, text: '100% Tested Organic Extracts' },
                      { icon: Award, text: '84+ Years Healing Legacy' },
                      { icon: Heart, text: 'Completely Safe, Zero Harm' },
                      { icon: Stethoscope, text: 'Expert Ayurvedic Clinicians' }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="flex gap-2.5 items-center">
                          <Icon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                          <span>{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Decorative background vector */}
                <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-6 translate-y-6 pointer-events-none">
                  <Heart className="w-60 h-60" />
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Video Testimonials Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs transition-opacity duration-300">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 aspect-video">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-colors shadow-md border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe 
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      {/* Treatments We Offer Section — only shown when the disease has entries */}
      {data.treatments.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-[#fcfdfc] to-[#f3f9f4]">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
                <Stethoscope className="w-3.5 h-3.5" />
                Our Specialities
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#152e1c] tracking-tight mb-3">
                Ayurvedic {disease.name} Treatments We Offer
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base font-medium">
                Root-cause Ayurvedic protocols tailored to every stage and complication of {disease.name.toLowerCase()}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.treatments.map((item, idx) => {
                // Kidney treatment pages fall back to a stock disease image rather than the
                // generic icon placeholder when the admin hasn't uploaded one yet.
                const fallbackImage = disease.name === 'Kidney' ? '/images/Polycystic-Kidney-Disease.jpg' : null;
                const displayImage = item.image || fallbackImage;

                return (
                <Link
                  key={idx}
                  href={`/${item.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden border border-[#edf2ed] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#cfe7d5] hover:shadow-[0_16px_36px_rgba(17,45,29,0.12)]"
                >
                  {/* Image area — a blurred, scaled copy of the image fills the frame as a backdrop
                      so any image dimensions (small, large, portrait, landscape) sit cleanly without
                      stretching or awkward cropping. */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-green-50 to-green-100 flex-shrink-0">
                    {displayImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={displayImage}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50"
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={displayImage}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Stethoscope className="w-10 h-10 text-[#1f4229]/30" />
                      </div>
                    )}
                  </div>

                  {/* Content area */}
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="text-base font-black text-[#152e1c] leading-snug mb-1.5">
                      {item.title}
                    </h3>
                    {item.short_description && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                        {item.short_description}
                      </p>
                    )}
                    <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs font-bold text-[#1f4229] group-hover:text-[#ef8716] transition-colors">
                      Read More
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Disease Content Section — rich text authored in the admin panel */}
      {data.content && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="rounded-[30px] border border-[#edf2ed] p-6 md:p-10">
              <article
                className="text-gray-700 text-base leading-relaxed
                           [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-[#112d1d] [&>h1]:mt-8 [&>h1]:mb-4
                           [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-[#112d1d] [&>h2]:mt-8 [&>h2]:mb-4
                           [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[#1a2e3b] [&>h3]:mt-6 [&>h3]:mb-3
                           [&>p]:mb-5
                           [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5 [&>ul>li]:mb-2
                           [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-5 [&>ol>li]:mb-2
                           [&>blockquote]:border-l-4 [&>blockquote]:border-[#1f4229] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#4d5f57] [&>blockquote]:mb-5
                           [&>strong]:text-[#1a2e3b] [&>strong]:font-bold
                           [&>em]:italic
                           [&_a]:text-[#1f4229] [&_a]:font-bold [&_a]:underline
                           [&_img]:rounded-2xl [&_img]:my-6"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            </div>
          </div>
        </section>
      )}

 <ClinicsSection />
      {/* Extra bottom space to prevent content from being covered by the sticky bar */}
      {/* <div className="h-24"></div> */}

      {/* Locations We Serve Section — only shown when locations are linked to this disease */}
      {locations.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-[#fcfdfc] to-[#f3f9f4]">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
                <MapPin className="w-3.5 h-3.5" />
                Near You
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#152e1c] tracking-tight mb-3">
                Locations We Serve for {disease.name}
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base font-medium">
                Karma Ayurveda offers {disease.name.toLowerCase()} treatment and consultations across these areas
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {locations.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/${loc.slug}`}
                  className="flex flex-col rounded-2xl overflow-hidden border border-[#edf2ed] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#cfe7d5] hover:shadow-[0_16px_36px_rgba(17,45,29,0.12)] p-4"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#1f4229] flex-shrink-0 overflow-hidden">
                      {loc.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-black text-[#152e1c] leading-snug truncate">{loc.name}</h3>
                      <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{loc.city}</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${loc.phone.replace(/[^0-9+]/g, '')}`; }}
                      className="text-[10px] font-bold text-[#ef8716] hover:underline cursor-pointer"
                    >
                      {loc.phone}
                    </button>
                    {loc.map_url && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(loc.map_url, '_blank', 'noopener,noreferrer'); }}
                        className="px-2 py-1 border border-gray-200 text-gray-600 hover:text-gray-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Map
                      </button>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/our-clinics"
                className="inline-flex items-center gap-2 rounded-full bg-[#1f4229] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#1f4229]/15 transition hover:bg-[#152e1c]"
              >
                View All Clinics
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <DiseaseFaqSection />
    </div>
  );
}
