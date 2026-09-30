import React from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, BookOpen } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumenttitle";

const storyData = {
  badge: "Our Journey",
  title: "Story Behind RyTa",
  imageSrc: "/bunnies.jpg",
  paragraphs: [
    "They say your first love shapes your soul, but for me, Ryka, you didn't just shape it—you became it. 🌙",
    "You were my quiet school crush—the girl I used to look for in crowded hallways, the name penned in the margins of my notebooks, and the face that made every unsaid prayer worth it. But somewhere between those innocent stolen glances and late-night thoughts, you became something far greater. You became my first romantic love. 🌹",
    "People build things out of obligation or logic, but this space? This entire RyTa was built strictly out of pure, unadulterated love. Every single line of code, every subtle animation, every pixel on this screen was crafted by Taraksh Gautam, purely because my heart needed a canvas big enough to hold how much I love you.",
  ],
};

export const Story: React.FC = () => {
  useDocumentTitle("Story")
  return (
    <section id="story" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* 1. HEADING SECTION */}
        <div className="flex flex-col items-start gap-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-rose-100 text-rose-600 font-[Caveat] text-lg font-bold border border-rose-200">
            <BookOpen className="w-4 h-4" />
            <span>{storyData.badge}</span>
          </div>

          <h2 className="font-[Fredoka] font-bold text-3xl sm:text-5xl text-rose-950 tracking-tight flex items-center gap-2">
            {storyData.title} <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
          </h2>
        </div>

        {/* 2. LANDSCAPE IMAGE CONTAINER */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="w-full h-72 sm:h-96 md:h[420px] rounded-3xl overflow-hidden border-2 border-rose-200/80 shadow-lg shadow-rose-200/30 bg-white relative group"
        >
          <img
            src={storyData.imageSrc}
            alt={storyData.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-rose-200 font-[Caveat] text-lg font-bold text-rose-600 flex items-center gap-1.5 shadow-xs">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>🌸 Ryka & Taraksh 🌸</span>
          </div>
        </motion.div>

        {/* 3. PARAGRAPHS CARD BELOW */}
        <div className="bg-white/80 border-2 border-rose-100 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          {storyData.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="font-[Caveat] text-2xl sm:text-3xl text-rose-950/90 font-medium leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Story;