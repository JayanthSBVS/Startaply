import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col transition-colors duration-300">
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-3xl px-6 pt-32">
            <div className="h-72 bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-neutral-800" />
            <div className="h-8 bg-white dark:bg-[#0a0a0a] rounded-full w-2/3 animate-pulse mt-8 border border-slate-100 dark:border-neutral-800" />
            <div className="h-5 bg-white dark:bg-[#0a0a0a] rounded-full w-1/2 animate-pulse border border-slate-100 dark:border-neutral-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!mela) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col transition-colors duration-300">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32">
          <Megaphone size={56} className="text-slate-300 dark:text-slate-700 mb-6" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Event Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">This Job Mela may have been removed or is no longer active.</p>
          <button
            onClick={() => navigate('/job-melas')}
            className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-brand/20"
          >
            ← Back to Job Melas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white transition-colors duration-300">

      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[50vh] min-h-[340px] max-h-[520px] overflow-hidden border-b border-slate-200 dark:border-slate-800">
        {heroImg ? (
          <img src={heroImg} alt={mela.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#EFF3FF] dark:from-slate-900 via-blue-50 dark:via-[#001F8E]/20 to-slate-200 dark:to-slate-950 flex items-center justify-center">
            <Megaphone size={80} className="text-[#1A62FE]/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/60 dark:via-slate-950/60 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate('/job-melas')}
          className="absolute top-28 left-6 md:left-10 z-20 flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-white font-bold text-sm px-4 py-2.5 rounded-full transition-all shadow-sm"
          aria-label="Back to Job Melas"
        >
          <ArrowLeft size={16} /> All Job Melas
        </button>

        {/* Live badge */}
        <div className="absolute top-28 right-6 md:right-10 z-20 inline-flex items-center gap-2 bg-[#001F8E] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#001F8E]/30">
          <span className="w-2 h-2 rounded-full bg-[#1A62FE] animate-ping" />
          Live Event
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-10 z-10">
          <div className="max-w-5xl mx-auto">
            {mela.company && (
              <div className="inline-flex items-center gap-2 bg-[#EFF3FF] dark:bg-[#1A62FE]/20 border border-[#001F8E]/20 text-[#001F8E] dark:text-[#1A62FE] font-bold text-xs px-3 py-1 rounded-lg mb-3">
                <Building2 size={14} /> {mela.company}
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-xl">
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
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-[#1A62FE]/40 transition-colors">
              <div className="p-3 bg-[#EFF3FF] dark:bg-[#1A62FE]/10 rounded-xl text-[#001F8E] dark:text-[#1A62FE] border border-[#1A62FE]/20 flex-shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Date</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{mela.date}</p>
              </div>
            </div>
          )}
          {mela.time && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-[#1A62FE]/40 transition-colors">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Time</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{mela.time}</p>
              </div>
            </div>
          )}
          {mela.venue && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-[#1A62FE]/40 transition-colors">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-[#1A62FE] dark:text-[#1A62FE] border border-blue-100 dark:border-blue-500/20 flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Venue</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{mela.venue}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left: main content column */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            {mela.description && (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 shadow-sm">
                <h2 className="text-base font-bold uppercase tracking-wider text-[#001F8E] dark:text-[#1A62FE] mb-4 flex items-center gap-2.5">
                  <Megaphone size={18} /> About This Event
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line text-sm md:text-base">
                  {mela.description}
                </p>
              </div>
            )}

            {/* Why Attend */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 shadow-sm">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#001F8E] dark:text-[#1A62FE] mb-5 flex items-center gap-2.5">
                <CheckCircle2 size={18} /> Why Attend?
              </h2>
              <ul className="space-y-3.5">
                {[
                  'Direct interaction with top verified recruiters',
                  'On-the-spot interview rounds and shortlist opportunities',
                  'High-growth startup and enterprise network connections',
                  '100% Free entry - walk in with multiple copies of your resume',
                  'Multiple hiring companies under one roof',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 font-medium text-sm">
                    <CheckCircle2 size={18} className="text-[#1A62FE] flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Google Map ── */}
            {(embedUrl) && (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-8 pt-7 pb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <MapPin size={18} className="text-[#001F8E] dark:text-[#1A62FE]" />
                    <h2 className="text-base font-bold uppercase tracking-wider text-[#001F8E] dark:text-[#1A62FE]">Event Location</h2>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(mela.venue || 'Job Mela')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#001F8E] dark:text-[#1A62FE] hover:underline bg-[#EFF3FF] dark:bg-[#1A62FE]/10 border border-[#1A62FE]/20 px-3 py-1.5 rounded-full transition-all"
                  >
                    <ExternalLink size={12} /> Open in Maps
                  </a>
                </div>

                <div className="px-6 pb-4">
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/40">
                    <iframe
                      key={embedUrl}
                      src={embedUrl}
                      title="Job Mela Location"
                      width="100%"
                      height="380"
                      style={{ border: 0, display: 'block', minHeight: '380px' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                  </div>
                </div>

                <div className="px-8 py-3 text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/40">
                  <MapPin size={12} className="text-[#1A62FE]" /> {mela.venue || 'See map for exact location'}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start space-y-5">

            {/* Register CTA */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 text-center shadow-lg shadow-[#001F8E]/5 transition-all">
              <div className="w-14 h-14 bg-[#EFF3FF] dark:bg-[#1A62FE]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#1A62FE]/20">
                <Users size={26} className="text-[#001F8E] dark:text-[#1A62FE]" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Ready to Register?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 font-medium leading-relaxed">
                Secure your spot at this verified Job Mela hiring drive.
              </p>

              {regLink ? (
                <a
                  href={regLink.startsWith('http') ? regLink : `https://${regLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#001F8E] hover:bg-[#1A62FE] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#001F8E]/20 active:scale-[0.98] group text-sm"
                >
                  Register Now <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              ) : (
                <div className="w-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium py-3.5 px-6 rounded-xl text-center text-xs border border-slate-100 dark:border-slate-700">
                  Registration Link Coming Soon
                </div>
              )}

              <button
                onClick={handleShare}
                className="mt-3.5 w-full bg-white dark:bg-slate-800 hover:bg-[#EFF3FF] dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-[#1A62FE]/40 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-sm"
                aria-label="Share Event"
              >
                <Share2 size={15} />
                {copied ? '✓ Link Copied!' : 'Share Event'}
              </button>
            </div>

            {/* Quick Details */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Quick Details</h3>
              {mela.company && (
                <div className="flex items-center gap-3 text-xs">
                  <Building2 size={16} className="text-[#001F8E] dark:text-[#1A62FE] flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{mela.company}</span>
                </div>
              )}
              {mela.date && (
                <div className="flex items-center gap-3 text-xs">
                  <Calendar size={16} className="text-[#001F8E] dark:text-[#1A62FE] flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{mela.date}</span>
                </div>
              )}
              {mela.time && (
                <div className="flex items-center gap-3 text-xs">
                  <Clock size={16} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{mela.time}</span>
                </div>
              )}
              {mela.venue && (
                <div className="flex items-start gap-3 text-xs">
                  <MapPin size={16} className="text-[#1A62FE] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium leading-snug">{mela.venue}</span>
                </div>
              )}
              {mapLink && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(mela.venue || 'Job Mela')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#001F8E] dark:text-[#1A62FE] hover:underline text-xs font-bold pt-1 transition-colors"
                >
                  <MapPin size={12} /> Open in Google Maps
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default JobMelaDetailPage;
