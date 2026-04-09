import React from 'react';

const features = [
  {
    title: 'No Login Required',
    desc: 'Start instantly. No friction. No signup walls.',
  },
  {
    title: 'Curated Jobs Only',
    desc: 'We filter noise so you don’t waste time.',
  },
  {
    title: 'Built for Speed',
    desc: 'Find and apply in seconds, not hours.',
  },
];

const WhySection = () => {
  return (
    <section 
      className="py-20 text-white relative"
      style={{
        backgroundImage: `linear-gradient(rgba(20, 83, 45, 0.45), rgba(20, 83, 45, 0.6)), url('/rear-view-adult-man-searching-new-job-working-writing-his-resume-laptop.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >

      <div className="max-w-6xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">
            Why Choose Strataply?
          </h2>
          <p className="text-green-100 mt-2">
            We remove everything that slows you down.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-6">

          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 hover:bg-white/20 transition"
            >
              <h3 className="font-semibold text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-green-100">
                {f.desc}
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default WhySection;