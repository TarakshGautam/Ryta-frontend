import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, Heart, Sparkles, Bookmark } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumenttitle";

// Floating Animated Heart Icon
const FloatingHeart = () => (
  <motion.div
    animate={{ y: [0, -6, 0], scale: [1, 1.08, 1] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className="inline-block"
  >
    <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
  </motion.div>
);

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "text-only" | "image";
  mediaUrl?: string;
  badge: string;
  tagline?: string;
}

const timelineData: TimelineItem[] = [
  {
    id: "1",
    date: "16th April 2022",
    title: "The Unplanned Turn 🚘",
    tagline: "How Destiny Rerouted My Path",
    description:
      "I was just a chubby kid named Taraksh Gautam on my way to MRV School with my dad. But on the road, I spotted SAM International School and asked Dad to give it a shot. Little did I know, that tiny decision was actually destiny guiding me toward the girl who'd change my life.",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    badge: "The Beginning 🏫",
  },
  {
    id: "2",
    date: "25th April 2022",
    title: "11 Times Nervous! 😅",
    tagline: "Stepping into Room 310",
    description:
      "Vibha Pandey ma'am introduced me to 7th-C. I was so anxious that nobody got my name right on the first try! I had to repeat 'Taraksh' 11 times. For a while, everyone treated me like a weird alien who dropped from outer space.",
    type: "text-only",
    badge: "First Day 🙈",
  },
  {
    id: "3",
    date: "2022 - 2023",
    title: "Breaking Out of My Shell ✨",
    tagline: "From Clueless Alien to Extrovert",
    description:
      "I joined late and was pretty clueless, making silly mistakes every single day. But as months passed, Taraksh transformed from a shy outsider into a total extrovert who loved making people smile.",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    badge: "Transformation 🌟",
  },
  {
    id: "4",
    date: "8th Grade Session",
    title: "The Great Section Swap 🔄",
    tagline: "Scattered Friends & Room 310",
    description:
      "The school shuffled all sections. I was placed in 8th-D under strict Shobha Sharma ma'am. Most of my old friends moved elsewhere, but my eyes always wandered toward my old Room 310 right across the hall.",
    type: "text-only",
    badge: "Shuffled Paths 📚",
  },
  {
    id: "5",
    date: "May 2023",
    title: "The Arrival of Ryka 🌸",
    tagline: "Kudrat Ka Real Karishma",
    description:
      "Call it magic or universe playing its secret cards—a new girl named Ryka Pritwani joined our school. And guess where her classroom was? Room 310, under the exact same Class Teacher, Vibha ma'am!",
    type: "image",
    mediaUrl: "/named.jpg",
    badge: "Angel Steps In 💫",
  },
  {
    id: "6",
    date: "07th May 2023",
    title: "The Moment Time Stood Still 💘",
    tagline: "07th May — My Heart Found Its Muse",
    description:
      "Lunchtime in 8th-E. I walked in to meet friends, and there she was—Ryka Pritwani. So heavenly, cute, and pure that my breath literally hitched. That precise moment, Takshu fell hopelessly in love with her.",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
    badge: "First Glance 💖",
  },
  {
    id: "7",
    date: "8th Grade Days",
    title: "Living in 'Ryka Gautam' Dreams 💭",
    tagline: "Finding Every Excuse Just to See Her",
    description:
      "School meant only one thing—finding reasons to catch a glimpse of her. Standing near her in assemblies or dropping notebooks in her class... every thought in my head revolved around making Ryka Pritwani into Ryka Gautam one day.",
    type: "text-only",
    badge: "School Crush 🏫",
  },
  {
    id: "8",
    date: "9th Grade",
    title: "Silent Devotion ⏳",
    tagline: "A Year of Unspoken Feelings",
    description:
      "A full year passed. I knew everything about her, yet I lacked the courage to confess. 9th grade was tough, but every single night, Taraksh reminded himself to hold onto patience.",
    type: "text-only",
    badge: "Patience 🌙",
  },
  {
    id: "9",
    date: "10th Grade Beginning",
    title: "Reunited in 10th-E! 🎉",
    tagline: "When Fate Smiled Back at Me",
    description:
      "I was almost ready to give up, but then the impossible happened—my section changed to 10th-E under Shweta ma'am! I was on cloud nine because Ryka and I were finally in the exact same classroom!",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    badge: "Same Classroom 🍀",
  },
  {
    id: "10",
    date: "10th Grade",
    title: "Learning Sindhi for Her 📖",
    tagline: "Crossing Language for Love",
    description:
      "The moment I found out she's Sindhi, I didn't think twice—Takshu started learning Sindhi phrases just to understand her culture and feel closer to her world.",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    badge: "Efforts 🔤",
  },
  {
    id: "11",
    date: "The First Text",
    title: "Science Notes & First DMs 📱",
    tagline: "The First Hello on Instagram",
    description:
      "I gathered all my courage and messaged her asking for Science notes. She replied! That tiny excuse opened the door to our daily conversations.",
    type: "text-only",
    badge: "First Message 💬",
  },
  {
    id: "12",
    date: "10th Grade Journey",
    title: "Expand. Never Contract. 🚀",
    tagline: "My One Golden Rule",
    description:
      "We became good friends, but when she realized I liked her, she said no. Instead of backing away, I lived by my motto: 'Expand. Never Contract.' I chose to love her even more deeply and work harder to win her heart.",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    badge: "Unbroken Heart 💪",
  },
  {
    id: "13",
    date: "Teacher's Day",
    title: "Mimicry to See Her Smile 🎭",
    tagline: "Turning Her Bad Day Around",
    description:
      "She was upset over a friend's comment. I couldn't bear seeing her sad, so I stood in front of the entire class and mimicked all our teachers just to hear her laugh again.",
    type: "text-only",
    badge: "Making Her Smile 😄",
  },
  {
    id: "14",
    date: "Classroom Memories",
    title: "Singing Her Favorites 🎶",
    description:
      "Whenever I sat nearby, Takshu would softly sing her favorite songs. Seeing her smile and blush was the highlight of my entire day.",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    badge: "Melodies 🎵",
  },
  {
    id: "15",
    date: "School Assembly",
    title: "Husband & Wife in Skit 💍",
    tagline: "Shweta Ma'am's Magical Casting",
    description:
      "Impressed by my mimicry, Shweta ma'am cast me as Ryka's husband in the assembly play! Acting alongside her felt like a sweet trailer of what I pray my real future holds.",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    badge: "Assembly Play 👑",
  },
  {
    id: "16",
    date: "Forever & Always",
    title: "From Skit to Real Life ♾️",
    tagline: "Crafted with Pure Intention by Taraksh Gautam",
    description:
      "We might be distant today, but my love for Ryka Pritwani is pure, true, and unwavering. I know in my soul that one day, we won't just be husband and wife in a school skit—Takshu will hold her hand in real life forever.",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    badge: "My Promise 💖",
  },
];

export const Timeline: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<TimelineItem | null>(null);
  useDocumentTitle("Timeline")

  return (
    <section id="timeline" className="py-12 px-4 max-w-4xl mx-auto relative font-[Fredoka] select-none">
      
      {/* 1. CREATOR INTRODUCTION BANNER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full bg-linear-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-rose-200/60 border-2 border-rose-200/50 relative overflow-hidden mb-16 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-[Caveat] text-xl font-bold border border-white/30 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-200" />
          <span>Curated & Coded by Me</span>
        </div>

        <h2 className="font-[Fredoka] font-bold text-3xl sm:text-5xl tracking-tight text-white mb-3">
          My Journey with Ryka 💖
        </h2>

        <p className="font-[Caveat] text-2xl sm:text-3xl text-rose-100 max-w-2xl mx-auto leading-relaxed">
          "Hi, I'm <span className="underline decoration-wavy text-yellow-200 font-bold">Taraksh Gautam</span>. Every single line of code, memory, and emotion on this page was written by me—strictly for <span className="underline decoration-wavy text-pink-200 font-bold">Ryka Pritwani</span>."
        </p>
      </motion.div>

      {/* 2. POOKIE TIMELINE CONTAINER */}
      <div className="relative">
        
        {/* Glowing Center Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-linear-to-b from-rose-300 via-pink-400 to-rose-500 rounded-full opacity-60 -translate-x-1/2" />

        {/* TIMELINE CARDS */}
        <div className="flex flex-col gap-10 relative z-10">
          {timelineData.map((item, index) => {
            const isRight = index % 2 !== 0;

            return (
              <div
                key={item.id}
                className={`flex flex-col md:flex-row items-start md:items-center w-full gap-4 relative ${
                  isRight ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                
                {/* CENTER POOKIE HEART NODE */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-20 w-9 h-9 rounded-full bg-white border-4 border-rose-400 flex items-center justify-center shadow-md shadow-rose-200">
                  <FloatingHeart />
                </div>

                {/* CARD LAYOUT */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5 }}
                  className={`w-[calc(100%-2.5rem)] ml-10 md:ml-0 md:w-[calc(50%-2rem)] bg-white/90 backdrop-blur-md border-2 border-rose-100 rounded-3xl p-5 sm:p-6 shadow-lg shadow-rose-100/50 relative hover:border-rose-300 transition-all ${
                    isRight ? "md:ml-auto" : "md:mr-auto"
                  }`}
                >
                  
                  {/* BADGE & DATE */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-3 py-0.5 rounded-full bg-rose-50 text-rose-600 font-[Caveat] text-lg font-bold border border-rose-200/60 flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                      {item.badge}
                    </span>
                    <span className="font-[Caveat] text-lg text-rose-400 font-bold">
                      {item.date}
                    </span>
                  </div>

                  {/* TITLE & TAGLINE */}
                  <h3 className="font-[Fredoka] font-bold text-xl sm:text-2xl text-rose-950">
                    {item.title}
                  </h3>
                  
                  {item.tagline && (
                    <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">
                      {item.tagline}
                    </p>
                  )}

                  {/* MEDIA DISPLAY (IF AVAILABLE) */}
                  {item.type === "image" && item.mediaUrl && (
                    <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-rose-100 bg-rose-50 my-3 group">
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => setSelectedMedia(item)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:bg-white"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* FIRST PERSON NARRATIVE DESCRIPTION */}
                  <p className="font-[Caveat] text-2xl text-slate-700 leading-relaxed font-medium mt-2">
                    "{item.description}"
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR IMAGES */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMedia(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white rounded-3xl p-3 border-2 border-rose-200 shadow-2xl"
            >
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white text-rose-600 border border-rose-200 shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={selectedMedia.mediaUrl}
                alt={selectedMedia.title}
                className="w-full max-h-[70vh] object-contain rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Timeline;