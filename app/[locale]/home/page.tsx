'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Stethoscope, 
  Activity, 
  Heart, 
  Users, 
  Calendar, 
  Shield,
  ArrowRight,
  Building2,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { mockClinicsAPI, mockDoctorsAPI } from '@/lib/api/mockData';
import type { Clinic } from '@/types/entities/Clinic';
import type { DoctorWithClinic } from '@/types/entities/Doctor';
import type { LucideIcon } from 'lucide-react';

// Display types for landing page
interface ClinicDisplay extends Clinic {
  icon: LucideIcon;
  color: string;
  patients: string;
}

interface DoctorDisplay extends DoctorWithClinic {
  name: string;
  specialty: string;
  experience: string;
  patients: string;
  image: string;
}

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: HomePageProps) {
  const { locale } = use(params);
  const t = useTranslations('landing');
  
  // State for clinics and doctors from database
  const [clinics, setClinics] = useState<ClinicDisplay[]>([]);
  const [doctors, setDoctors] = useState<DoctorDisplay[]>([]);
  
  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const registerCardsRef = useRef<HTMLDivElement>(null);
  const clinicsRef = useRef<HTMLDivElement>(null);
  const doctorsRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Load clinics and doctors from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load clinics
        const allClinics = await mockClinicsAPI.getClinics();
        const icons = [Heart, Activity, Stethoscope, Shield, Building2];
        const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-teal-500'];
        const topClinics: ClinicDisplay[] = allClinics.slice(0, 5).map((clinic, index) => ({
          ...clinic,
          icon: icons[index % icons.length],
          patients: '2,500+',
          color: colors[index % colors.length],
        }));
        setClinics(topClinics);

        // Load doctors
        const allDoctors = await mockDoctorsAPI.getDoctors();
        const images = [
          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
        ];
        const topDoctors: DoctorDisplay[] = allDoctors.slice(0, 5).map((doctor, index) => ({
          ...doctor,
          name: doctor.username.replace('dr_', 'Dr. ').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          specialty: doctor.specialization,
          experience: doctor.years_of_experience ? `${doctor.years_of_experience}+ years` : '10+ years',
          patients: '2,500+',
          image: images[index % images.length],
        }));
        setDoctors(topDoctors);
      } catch (error) {
        setClinics([]);
        setDoctors([]);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      if (heroTextRef.current) {
        gsap.from(heroTextRef.current.children, {
          opacity: 0,
          y: 50,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
        });
      }

      // Parallax effect on hero image
      if (heroImageRef.current) {
        gsap.to(heroImageRef.current, {
          y: 100,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Register cards animation
      if (registerCardsRef.current) {
        gsap.from(registerCardsRef.current.children, {
          opacity: 0,
          scale: 0.8,
          y: 50,
          duration: 0.8,
          stagger: 0.2,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: registerCardsRef.current,
            start: 'top 80%',
          },
        });
      }

      // Stats animation
      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
          },
        });
      }

      // Clinics section animation
      if (clinicsRef.current) {
        gsap.from(clinicsRef.current.querySelectorAll('.clinic-card'), {
          opacity: 0,
          y: 50,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: clinicsRef.current,
            start: 'top 75%',
          },
        });
      }

      // Doctors section animation
      if (doctorsRef.current) {
        gsap.from(doctorsRef.current.querySelectorAll('.doctor-card'), {
          opacity: 0,
          x: locale === 'ar' ? 50 : -50,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: doctorsRef.current,
            start: 'top 75%',
          },
        });
      }

      // Partners animation - continuous scroll
      if (partnersRef.current) {
        const partnersContainer = partnersRef.current.querySelector('.partners-track');
        if (partnersContainer) {
          gsap.to(partnersContainer, {
            x: locale === 'ar' ? '0%' : '-50%',
            duration: 20,
            ease: 'none',
            repeat: -1,
          });
        }
      }
    });

    return () => ctx.revert();
  }, [locale]);

  const partners = [
    { name: 'Cairo University', logo: '/logo.png' },
    { name: 'Kasr Al Ainy Hospital', logo: '/logo.png' },
    { name: 'Ministry of Health', logo: '/logo.png' },
    { name: 'WHO Egypt', logo: '/logo.png' },
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: t('stats.patients') },
    { icon: Stethoscope, value: '150+', label: t('stats.doctors') },
    { icon: Building2, value: '25+', label: t('stats.clinics') },
    { icon: Calendar, value: '50,000+', label: t('stats.visits') },
  ];

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Outpatient Clinic',
    alternateName: locale === 'ar' ? 'عيادة خارجية' : 'Outpatient Clinic',
    description: t('hero.subtitle'),
    url: `https://codeblue.eg/${locale}`,
    logo: 'https://codeblue.eg/logo.png',
    image: 'https://codeblue.eg/logo.png',
    telephone: '+20223648603',
    email: 'info@codeblue.eg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kasr Al Ainy Street',
      addressLocality: 'El-Manial',
      addressRegion: 'Cairo',
      postalCode: '11562',
      addressCountry: 'EG',
    },
    parentOrganization: {
      '@type': 'EducationalOrganization',
      name: 'Cairo University',
      url: 'https://cu.edu.eg',
    },
    medicalSpecialty: [
      'Internal Medicine',
      'Cardiology',
      'Orthopedics',
      'Neurology',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '10000',
    },
    sameAs: [
      'https://facebook.com/CodeBlueEG',
      'https://twitter.com/CodeBlueEG',
      'https://linkedin.com/company/codeblue-eg',
      'https://instagram.com/CodeBlueEG',
    ],
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://codeblue.eg/${locale}`,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar locale={locale} />

      {/* Hero Section */}
      <section 
        id="home"
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background Image with Parallax */}
        <div 
          ref={heroImageRef}
          className="absolute inset-0 z-0"
        >
          <Image
            src="/new-hero-compress.png"
            alt="Healthcare Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-blue-900/90 to-transparent dark:from-gray-900/95 dark:via-blue-950/90" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl" ref={heroTextRef}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/${locale}/login`}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg group"
                >
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {/* <Link href={`/${locale}/register`}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg group"
                >
                  {t('hero.ctaDoctor')}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white dark:text-white hover:bg-white hover:text-emerald-900 dark:hover:text-emerald-900 px-8 py-6 text-lg"
                >
                  {t('hero.ctaPatient')}
                </Button>
              </Link> */}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 border-y border-emerald-100 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section - What We Do */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('services.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            {/* Image */}
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/banner_1.png"
                alt="Healthcare Services"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/30 to-transparent dark:from-emerald-900/50 dark:to-transparent" />
            </div>

            {/* Services List */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.feature1.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('services.feature1.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.feature2.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('services.feature2.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.feature3.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('services.feature3.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.feature4.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('services.feature4.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Register Cards Section - hidden: registrations disabled, use login only */}
      {false && (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('register.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('register.subtitle')}
            </p>
          </div>

          <div ref={registerCardsRef} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Doctor Registration Card */}
            <Card className="relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300 border-2 border-emerald-200 dark:border-emerald-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <CardHeader className="relative">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-2xl">{t('register.doctor.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('register.doctor.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                    {t('register.doctor.feature1')}
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                    {t('register.doctor.feature2')}
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                    {t('register.doctor.feature3')}
                  </li>
                </ul>
                <Link href={`/${locale}/register`}>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 group">
                    {t('register.doctor.cta')}
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Patient Registration Card */}
            <Card className="relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300 border-2 border-blue-200 dark:border-blue-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <CardHeader className="relative">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">{t('register.patient.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('register.patient.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    {t('register.patient.feature1')}
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    {t('register.patient.feature2')}
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    {t('register.patient.feature3')}
                  </li>
                </ul>
                <Link href={`/${locale}/register`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 group">
                    {t('register.patient.cta')}
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      )}

      {/* Clinics Section */}
      <section id='clinics' ref={clinicsRef} className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('clinics.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('clinics.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {clinics.map((clinic) => {
              const Icon = clinic.icon;
              return (
                <Card 
                  key={clinic.id} 
                  className="clinic-card hover:shadow-lg transition-all duration-300 group border-t-4"
                  style={{ borderTopColor: clinic.color.replace('bg-', '#') }}
                >
                  <CardHeader>
                    <div className={`w-14 h-14 ${clinic.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{clinic.name}</CardTitle>
                    <CardDescription>{clinic.department}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {clinic.patients}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full group/btn">
                      {t('clinics.learnMore')}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id='doctors' ref={doctorsRef} className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('doctors.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('doctors.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="doctor-card overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-blue-500">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{doctor.name}</CardTitle>
                  <CardDescription className="text-sm">{doctor.specialty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <Award className="w-3 h-3 mr-2 text-emerald-500" />
                      {doctor.experience}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <Users className="w-3 h-3 mr-2 text-emerald-500" />
                      {doctor.patients} {t('doctors.patients')}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-sm">
                    {t('doctors.viewProfile')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section ref={partnersRef} className="py-20 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('partners.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('partners.subtitle')}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="partners-track flex gap-16 items-center">
            {[...partners, ...partners].map((partner, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-48 h-24 relative grayscale hover:grayscale-0 transition-all duration-300"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-800 dark:to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Link href={`/${locale}/login`}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg group">
              {t('cta.button')}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer locale={locale} />
      </div>
    </>
  );
}
