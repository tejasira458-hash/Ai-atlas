
import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-6">
          Why parents and kids <span className="text-blue-600 underline decoration-yellow-400 decoration-8 underline-offset-4">love</span> AI ATLAS
        </h2>
        <p className="text-xl text-slate-500 font-medium mb-12">
          We transform the most boring textbook pages into magical adventures that kids actually want to read.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-blue-50 hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl text-blue-600 mx-auto mb-6">
              <i className="fas fa-child-reaching"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3">Kid-Safe AI</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Every explanation is curated using "Living Room Language" — simple, safe, and positive.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-orange-50 hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl text-orange-600 mx-auto mb-6">
              <i className="fas fa-images"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3">Multi-Modal</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Upload textbook PDFs, snap photos of homework, or just ask. We see and understand everything.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-green-50 hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl text-green-600 mx-auto mb-6">
              <i className="fas fa-brain"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3">Memory Magic</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              We don't just explain; we provide funny memory tricks to make sure the learning sticks!
            </p>
          </div>
        </div>

        <div className="mt-20 bg-blue-600 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 rotate-12">🚀</div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl font-black mb-6">Built for Curiously Growing Minds</h3>
            <p className="text-lg text-blue-100 font-medium mb-8">
              AI ATLAS is a world-class educational tool that bridges the gap between complex academics and childhood curiosity. We believe every child can learn anything if it's explained the right way.
            </p>
            <div className="flex justify-center space-x-4">
              <span className="bg-white/10 px-4 py-2 rounded-full text-sm font-bold border border-white/20">Certified Helpful</span>
              <span className="bg-white/10 px-4 py-2 rounded-full text-sm font-bold border border-white/20">Privacy First</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
