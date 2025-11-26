'use client';

import { use, useEffect, useRef } from 'react';
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
  
  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const registerCardsRef = useRef<HTMLDivElement>(null);
  const clinicsRef = useRef<HTMLDivElement>(null);
  const doctorsRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

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

  // Mock data
  const clinics = [
    {
      id: 1,
      name: t('clinics.internal.name'),
      description: t('clinics.internal.description'),
      icon: Heart,
      patients: '2,500+',
      color: 'bg-emerald-500',
    },
    {
      id: 2,
      name: t('clinics.orthopedics.name'),
      description: t('clinics.orthopedics.description'),
      icon: Activity,
      patients: '1,800+',
      color: 'bg-blue-500',
    },
    {
      id: 3,
      name: t('clinics.cardiology.name'),
      description: t('clinics.cardiology.description'),
      icon: Stethoscope,
      patients: '2,200+',
      color: 'bg-red-500',
    },
    {
      id: 4,
      name: t('clinics.neurology.name'),
      description: t('clinics.neurology.description'),
      icon: Shield,
      patients: '1,500+',
      color: 'bg-purple-500',
    },
  ];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Ahmed Hassan',
      specialty: t('doctors.specialties.cardiology'),
      experience: '15+ years',
      patients: '3,000+',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    },
    {
      id: 2,
      name: 'Dr. Sarah Mohamed',
      specialty: t('doctors.specialties.internal'),
      experience: '12+ years',
      patients: '2,500+',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    },
    {
      id: 3,
      name: 'Dr. Omar Khalil',
      specialty: t('doctors.specialties.orthopedics'),
      experience: '10+ years',
      patients: '2,000+',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    },
  ];

  const partners = [
    { name: 'Cairo University', logo: '/logo-gemini.png' },
    { name: 'Kasr Al Ainy Hospital', logo: '/logo-chatgpt.png' },
    { name: 'Ministry of Health', logo: '/logo-gemini.png' },
    { name: 'WHO Egypt', logo: '/logo-chatgpt.png' },
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: t('stats.patients') },
    { icon: Stethoscope, value: '150+', label: t('stats.doctors') },
    { icon: Building2, value: '25+', label: t('stats.clinics') },
    { icon: Calendar, value: '50,000+', label: t('stats.visits') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background Image with Parallax */}
        <div 
          ref={heroImageRef}
          className="absolute inset-0 z-0"
        >
          <Image
            src="https://www.koruux.com/_next/image/?url=%2Fassets%2F50-examples-healthcare%2Fnew-hero-compress.webp&w=3840&q=80"
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
              <Link href={`/${locale}/register`}>
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
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-emerald-900 px-8 py-6 text-lg"
                >
                  {t('hero.ctaPatient')}
                </Button>
              </Link>
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

      {/* Register Cards Section */}
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

      {/* Clinics Section */}
      <section ref={clinicsRef} className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('clinics.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('clinics.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <CardDescription>{clinic.description}</CardDescription>
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
      <section ref={doctorsRef} className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('doctors.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('doctors.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="doctor-card overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 bg-gradient-to-br from-emerald-400 to-blue-500">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{doctor.name}</CardTitle>
                  <CardDescription className="text-base">{doctor.specialty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Award className="w-4 h-4 mr-2 text-emerald-500" />
                      {doctor.experience}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-2 text-emerald-500" />
                      {doctor.patients} {t('doctors.patients')}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
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
          <Link href={`/${locale}/register`}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg group">
              {t('cta.button')}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  );
}
