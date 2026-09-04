'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Share2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { 
  SiteProfileItem, 
  updateSiteProfileAction 
} from '@/app/actions/siteProfileActions';

interface SiteProfileManagerClientProps {
  initialProfile: SiteProfileItem;
}

export default function SiteProfileManagerClient({ initialProfile }: SiteProfileManagerClientProps) {
  // Form states
  const [name, setName] = useState(initialProfile.name || '');
  const [logo, setLogo] = useState(initialProfile.logo || '');
  const [favicon, setFavicon] = useState(initialProfile.favicon || '');
  const [email, setEmail] = useState(initialProfile.email || '');
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [usPhone, setUsPhone] = useState(initialProfile.us_phone || '');
  const [address, setAddress] = useState(initialProfile.address || '');
  const [xLink, setXLink] = useState(initialProfile.x_link || '');
  const [fbLink, setFbLink] = useState(initialProfile.fb_link || '');
  const [igLink, setIgLink] = useState(initialProfile.ig_link || '');
  const [ytLink, setYtLink] = useState(initialProfile.yt_link || '');
  const [waNumber, setWaNumber] = useState(initialProfile.wa_number || '');
  const [waChannel, setWaChannel] = useState(initialProfile.wa_channel || '');
  const [nabhLogo, setNabhLogo] = useState(initialProfile.nabh_logo || '');
  const [nabhCertNum, setNabhCertNum] = useState(initialProfile.nabh_cert_num || '');
  const [nabhDuration, setNabhDuration] = useState(initialProfile.nabh_duration || '');
  const [totalHospitals, setTotalHospitals] = useState<string>(initialProfile.total_hospitals?.toString() || '0');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!name.trim() || !logo.trim() || !favicon.trim() || !email.trim() || !phone.trim() || !usPhone.trim() || !address.trim()) {
      setError('Name, Logo, Favicon, Email, Phone, US Phone, and Address are required fields.');
      setSubmitting(false);
      return;
    }

    const payload = {
      name: name.trim(),
      logo: logo.trim(),
      favicon: favicon.trim(),
      email: email.trim(),
      phone: phone.trim(),
      us_phone: usPhone.trim(),
      address: address.trim(),
      x_link: xLink.trim() || undefined,
      fb_link: fbLink.trim() || undefined,
      ig_link: igLink.trim() || undefined,
      yt_link: ytLink.trim() || undefined,
      wa_number: waNumber.trim() || undefined,
      wa_channel: waChannel.trim() || undefined,
      nabh_logo: nabhLogo.trim() || undefined,
      nabh_cert_num: nabhCertNum.trim() || undefined,
      nabh_duration: nabhDuration.trim() || undefined,
      total_hospitals: parseInt(totalHospitals) || 0
    };

    try {
      const result = await updateSiteProfileAction(payload);
      if (result.success) {
        setSuccess('Site profile settings updated successfully!');
      } else {
        setError(result.error || 'Failed to update site profile.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred while saving.');
    } finally {
      setSubmitting(false);
      startTransition(() => {});
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Site Settings</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Site Profile</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Site Profile Configuration</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage global contact channels, logos, certificates, and social networks</p>
          </div>
        </div>
      </div>

      {/* Error/Success Feedbacks */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: General Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="w-4 h-4 text-slate-400" />
            General Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Website Name*</label>
              <input
                required
                type="text"
                placeholder="e.g. Karma Ayurveda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Associated Hospitals*</label>
              <input
                required
                type="number"
                placeholder="e.g. 10"
                value={totalHospitals}
                onChange={(e) => setTotalHospitals(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Branding Assets */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            Branding Assets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Logo Image URL*</label>
                <input
                  required
                  type="text"
                  placeholder="https://domain.com/logo.png"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Favicon Image URL*</label>
                <input
                  required
                  type="text"
                  placeholder="https://domain.com/favicon.ico"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Logo/Favicon Preview Area */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col justify-center space-y-4">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Branding Preview</span>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[8px] text-slate-400 block mb-1">Logo</span>
                  <div className="h-16 w-32 border border-slate-200 bg-white rounded-lg flex items-center justify-center p-2 shadow-inner overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {logo.trim() ? (
                      <img src={logo} alt="Logo" className="object-contain max-h-12" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-200" />
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[8px] text-slate-400 block mb-1">Favicon</span>
                  <div className="h-10 w-10 border border-slate-200 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {favicon.trim() ? (
                      <img src={favicon} alt="Favicon" className="object-contain h-6 w-6" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    ) : (
                      <Globe className="w-4 h-4 text-slate-200" />
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Card 3: Contact Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-4 h-4 text-slate-400" />
            Contact & Address Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email Address*</label>
              <input
                required
                type="email"
                placeholder="info@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Phone Number*</label>
              <input
                required
                type="text"
                placeholder="+91 99999 99999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">US/International Phone*</label>
              <input
                required
                type="text"
                placeholder="+1 (800) 555-0199"
                value={usPhone}
                onChange={(e) => setUsPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Physical Address*</label>
            <textarea
              required
              rows={3}
              placeholder="Enter complete office/hq address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Card 4: NABH Credentials */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="w-4 h-4 text-slate-400" />
            NABH Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-2">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">NABH Certificate Logo URL</label>
                <input
                  type="text"
                  placeholder="https://domain.com/nabh-logo.png"
                  value={nabhLogo}
                  onChange={(e) => setNabhLogo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Certificate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. NABH/CERT/1937"
                    value={nabhCertNum}
                    onChange={(e) => setNabhCertNum(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Validity / Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Years (Valid till Dec 2027)"
                    value={nabhDuration}
                    onChange={(e) => setNabhDuration(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* NABH Preview Image */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col justify-center space-y-1.5 md:col-span-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">NABH Logo Preview</span>
              <div className="h-24 border border-slate-200 bg-white rounded-lg flex items-center justify-center p-2 shadow-inner overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {nabhLogo.trim() ? (
                  <img src={nabhLogo} alt="NABH Logo" className="object-contain max-h-20" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                ) : (
                  <Award className="w-6 h-6 text-slate-200" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Social Media & WhatsApp */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Share2 className="w-4 h-4 text-slate-400" />
            Social Media & Messaging
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">WhatsApp Business Number</label>
              <input
                type="text"
                placeholder="e.g. +91 99999 99999"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">WhatsApp Channel Link</label>
              <input
                type="url"
                placeholder="https://whatsapp.com/channel/..."
                value={waChannel}
                onChange={(e) => setWaChannel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">X (formerly Twitter) Profile Link</label>
              <input
                type="url"
                placeholder="https://x.com/username"
                value={xLink}
                onChange={(e) => setXLink(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Facebook Page Link</label>
              <input
                type="url"
                placeholder="https://facebook.com/page"
                value={fbLink}
                onChange={(e) => setFbLink(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Instagram Profile Link</label>
              <input
                type="url"
                placeholder="https://instagram.com/username"
                value={igLink}
                onChange={(e) => setIgLink(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">YouTube Channel Link</label>
              <input
                type="url"
                placeholder="https://youtube.com/channel"
                value={ytLink}
                onChange={(e) => setYtLink(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>

          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-3 flex items-center justify-end border-t border-slate-200">
          <button
            type="submit"
            disabled={submitting || isPending}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60 transition-all border-none"
          >
            {submitting || isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Profile Settings...
              </>
            ) : (
              <>
                Save Profile Configuration
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </main>
  );
}
