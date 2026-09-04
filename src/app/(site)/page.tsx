import HeroCarousel from '@/components/home/HeroCarousel';
import IntroSection from '@/components/home/IntroSection';
import BookingForm from '@/components/home/BookingForm';
import DiseaseSection from '@/components/home/DiseaseSection';
import HealingCTA from '@/components/home/HealingCTA';
import PillarsSection from '@/components/home/PillarsSection';
import AboutDoctorSection from '@/components/home/AboutDoctorSection';
import InsuranceSection from '@/components/home/InsuranceSection';
import FAQSection from '@/components/home/FAQSection';
import ClinicsSection from '@/components/home/ClinicsSection';

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <IntroSection />
      {/* <BookingForm /> */}
      <DiseaseSection />
      <HealingCTA />
      <PillarsSection />
      <AboutDoctorSection />
      <InsuranceSection />
      <FAQSection />
      <ClinicsSection />
    </>
  );
}
