import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  Calendar, MapPin, Clock, Building2, ExternalLink,
  ArrowLeft, Megaphone, Users, CheckCircle2, Share2
} from 'lucide-react';

const JobMelaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mela, setMela] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get('/api/job-mela')
      .then(res => {
        const found = res.data.find(m => String(m.id) === String(id));
        if (found) {
          setMela({
            ...found,
            description: found.description?.replace(/thei sjob mea/gi, 'this job mela')
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Normalize DB lowercase field names vs camelCase
  const bannerImg = mela?.bannerimage || mela?.bannerImage;
  const rawMapLink = mela?.googlemaplink || mela?.googleMapLink;
  const regLink   = mela?.registrationlink || mela?.registrationLink;
  const heroImg   = bannerImg || mela?.image;

  /**
   * Smart embed URL builder:
   * - If the stored URL already contains '/maps/embed' or 'output=embed'  → use as-is
   * - If it's a regular Google Maps share/place URL  → convert via venue q= param
   * - If no URL but venue exists → build a search embed from venue text
   * This ensures the iframe ALWAYS renders something visible.
   */
  const getEmbedUrl = (url, venue) => {
    // Already a proper embed URL
    if (url && (url.includes('/maps/embed') || url.includes('output=embed'))) return url;
    // Venue available → build reliable search embed (no API key needed)
    if (venue) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(venue)}&output=embed&iwloc=&z=15`;
    }
    // Last resort: try appending output=embed to whatever URL was given
    if (url) {
      try {
        const u = new URL(url);
        u.searchParams.set('output', 'embed');
        return u.toString();
      } catch { return url; }
    }
    return null;
  };

  const mapLink = rawMapLink || mela?.venue; // show map if either link OR venue exists
  const embedUrl = mela ? getEmbedUrl(rawMapLink, mela.venue) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-3xl px-6 pt-32">
            <div className="h-72 bg-slate-800/50 rounded-[2.5rem] animate-pulse" />
            <div className="h-8 bg-slate-800/50 rounded-full w-2/3 animate-pulse mt-8" />
            <div className="h-5 bg-slate-800/50 rounded-full w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!mela) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32">
          <Megaphone size={56} className="text-slate-700 mb-6" />
          <h2 className="text-2xl font-black text-white mb-3">Event Not Found</h2>
          <p className="text-slate-400 mb-8">This Job Mela may have been removed or is no longer active.</p>
          <button
            onClick={() => navigate('/job-melas')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-8 rounded-full transition-all"
          >
            ← Back to Job Melas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      <Navbar />

      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[50vh] min-h-[340px] max-h-[520px] overflow-hidden">
        {heroImg ? (
          <img src={heroImg} alt={mela.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 flex items-center justify-center">
            <Megaphone size={80} className="text-emerald-500/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate('/job-melas')}
          className="absolute top-28 left-6 md:left-10 z-20 flex items-center gap-2 bg-slate-900/70 backdrop-blur-md hover:bg-slate-800 border border-white/10 text-white font-bold text-sm px-4 py-2.5 rounded-full transition-all"
        >
          <ArrowLeft size={16} /> All Job Melas
        </button>

        {/* Live badge */}
        <div className="absolute top-28 right-6 md:right-10 z-20 inline-flex items-center gap-2 bg-emerald-500 text-slate-950 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
          Live Event
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-10 z-10">
          <div className="max-w-5xl mx-auto">
            {mela.company && (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                <Building2 size={16} /> {mela.company}
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-xl">
              {mela.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">

        {/* Quick-info pills row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {mela.date && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Date</p>
                <p className="font-black text-white text-sm">{mela.date}</p>
              </div>
            </div>
          )}
          {mela.time && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Time</p>
                <p className="font-black text-white text-sm">{mela.time}</p>
              </div>
            </div>
          )}
          {mela.venue && (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20 flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Venue</p>
                <p className="font-black text-white text-sm leading-snug">{mela.venue}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Two-column layout ── */}
        {/*
          FIX: sticky is on the COLUMN wrapper (self-start + sticky top-24),
          NOT on an inner child card. This prevents overlap/corruption.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left: main content column */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            {mela.description && (
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-8">
                <h2 className="text-lg font-black uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-3">
                  <Megaphone size={18} /> About This Event
                </h2>
                <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {mela.description}
                </p>
              </div>
            )}

            {/* Why Attend */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-8">
              <h2 className="text-lg font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-3">
                <CheckCircle2 size={18} /> Why Attend?
              </h2>
              <ul className="space-y-4">
                {[
                  'Direct interaction with top recruiters',
                  'On-the-spot interview opportunities',
                  'Network with industry professionals',
                  'Free entry — walk in with your resume',
                  'Multiple companies under one roof',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 font-medium text-sm">
                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Google Map ── */}
            {(embedUrl) && (
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem]">
                <div className="px-8 pt-8 pb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-blue-400" />
                    <h2 className="text-lg font-black uppercase tracking-widest text-blue-400">Event Location</h2>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(mela.venue || 'Job Mela')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full"
                  >
                    <ExternalLink size={12} /> Open in Maps
                  </a>
                </div>

                {/* Explicit pixel height iframe — no overflow-hidden clipping */}
                <div className="px-4 pb-4">
                  <div className="rounded-2xl overflow-hidden border border-slate-700/40">
                    <iframe
                      key={embedUrl}
                      src={embedUrl}
                      title="Job Mela Location"
                      width="100%"
                      height="420"
                      style={{ border: 0, display: 'block', minHeight: '420px' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                  </div>
                </div>

                <div className="px-8 py-4 text-xs text-slate-500 font-bold flex items-center gap-2">
                  <MapPin size={12} /> {mela.venue || 'See map for exact location'}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Sidebar ──
              FIX: sticky + self-start on the COLUMN div, not an inner card.
              This makes the whole sidebar scroll correctly without any overlap.
          */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start space-y-5">

            {/* Register CTA */}
            <div className="bg-gradient-to-br from-emerald-600/20 to-slate-900/60 border border-emerald-500/30 rounded-[2rem] p-7 text-center shadow-xl shadow-emerald-900/20">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
                <Users size={28} className="text-emerald-400" />
              </div>
              <h3 className="font-black text-lg text-white mb-2">Ready to Register?</h3>
              <p className="text-slate-400 text-sm mb-6 font-medium leading-relaxed">
                Secure your spot at this exclusive Job Mela event.
              </p>

              {regLink ? (
                <a
                  href={regLink.startsWith('http') ? regLink : `https://${regLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] group"
                >
                  Register Now <ExternalLink size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              ) : (
                <div className="w-full bg-slate-800 text-slate-500 font-bold py-4 px-6 rounded-xl text-center text-sm">
                  Registration Link Coming Soon
                </div>
              )}

              <button
                onClick={handleShare}
                className="mt-4 w-full bg-slate-800/60 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 text-slate-300 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
              >
                <Share2 size={16} />
                {copied ? '✓ Link Copied!' : 'Share Event'}
              </button>
            </div>

            {/* Quick Details */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-7 space-y-4">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Quick Details</h3>
              {mela.company && (
                <div className="flex items-center gap-3 text-sm">
                  <Building2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">{mela.company}</span>
                </div>
              )}
              {mela.date && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">{mela.date}</span>
                </div>
              )}
              {mela.time && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-amber-400 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">{mela.time}</span>
                </div>
              )}
              {mela.venue && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 font-medium leading-snug">{mela.venue}</span>
                </div>
              )}
              {mapLink && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(mela.venue || 'Job Mela')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-bold pt-1 transition-colors"
                >
                  <MapPin size={12} /> Open in Google Maps
                </a>
              )}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobMelaDetailPage;
