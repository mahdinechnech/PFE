"use client";

import { motion} from "framer-motion";
import { useState } from "react";
import { User, Star, ChevronLeft, ChevronRight, Car } from "lucide-react";

const testimonials = [
  {
    name: "Hadjer",
    role: "Cliente",
    text: "Service rapide et très professionnel.",
    emoji: <User size={20} />,
    rating: 5,
  },
  {
    name: "Amine",
    role: "Client",
    text: "coti livriso ma3andi man9ol .",
    emoji: <User size={20} />,
    rating: 4,
  },
  {
    name: "Lamia",
    role: "Cliente",
    text: "Livraison trés rapide et livreur respectueux .",
    emoji: <User size={20} />,
    rating: 5,
  },
  {
    name: "Hani chipa",
    role: "Client",
    text: "3ajbetni la peinture , n3awed n3ayet nchallah.",
    emoji: <User size={20} />,
    rating: 5,
  },
  {
    name: " Sally",
    role: "Cliente",
    text: "Coiffeuse incroyable! j'ai adoré.",
    emoji: <User size={20} />,
    rating: 5,
  },
  {
    name: "Ladrello",
    role: "Client",
    text: "la résultat hayel .",
    emoji: <Car size={20} />,
    rating: 5,
  },
];




export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const next = () => {
  setIndex((prev) => (prev + 1) % testimonials.length);
};

const prev = () => {
  setIndex((prev) =>
    prev === 0 ? testimonials.length - 1 : prev - 1
);
};
  
  return (
    <section className="py-16 px-6 md:px-20" id="avis">
      <h2 className="text-2xl font-bold text-[#4b463d] mb-10">
        Avis clients
      </h2>

      {/* MAIN GRID */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12">

{/* LEFT SCROLL CARDS */}
<div className="w-full md:w-105 overflow-hidden">

  <motion.div
    animate={{ x: `-${index * 100}%` }}
    transition={{ type: "spring", stiffness: 60 }}
    className="flex"
  >
    {testimonials.map((t, i) => (
      <div
        key={i}
        className="min-w-full pr-4"
      >
        <div className="bg-[#eee8e0] rounded-2xl shadow-md p-5">
          <p className="text-sm text-[#4b463d] italic mb-3">
            "{t.text}"
          </p>

          {/* RATING */}
          <div className="flex mb-2 gap-0.5">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          <h4 className="text-sm font-semibold text-[#4b463d]">
            {t.name}
          </h4>
          <span className="text-xs text-gray-500">
            {t.role}
          </span>
        </div>
      </div>
    ))}
  </motion.div>

  {/* CONTROLS */}
  <div className="flex items-center gap-3 mt-4">
    <button onClick={prev} className="text-orange-500 hover:text-orange-600 transition cursor-pointer">
      <ChevronLeft size={24} />
    </button>
    <button onClick={next} className="text-orange-500 hover:text-orange-600 transition cursor-pointer">
      <ChevronRight size={24} />
    </button>

    {/* DOTS */}
    <div className="flex gap-2 ml-4">
      {testimonials.map((_, i) => (
        <div
          key={i}
          onClick={() => setIndex(i)}
          className={`w-2 h-2 rounded-full cursor-pointer ${
            i === index ? "bg-orange-500" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  </div>

</div>

        {/* RIGHT VISUAL (LIKE YOUR IMAGE) */}
{/* RIGHT ANIMATED CIRCLE */}
{/* RIGHT ANIMATED EMPTY CIRCLE */}
<div className="relative w-65 h-65 flex items-center justify-center">

  {/* OUTER ROTATION */}
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
    className="absolute w-65 h-65 border border-orange-200 rounded-full"
  />

  {/* INNER ROTATION */}
  <motion.div
    animate={{ rotate: -360 }}
    transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
    className="absolute w-50 h-50 border border-orange-100 rounded-full"
  />

  {/* FLOATING AVATARS */}
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
    className="absolute w-full h-full"
  >
    {testimonials.map((t, i) => {
      const angle = (i / testimonials.length) * 360;
      const radius = 100;

      return (
        <div
          key={i}
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `
              rotate(${angle}deg)
              translate(${radius}px)
              rotate(-${angle}deg)
            `,
          }}
        >
          <div className="w-10 h-10 rounded-full bg-[#d5cebf] flex items-center justify-center text-sm shadow">
            {t.emoji}
          </div>
        </div>
      );
    })}
  </motion.div>

</div>
      </div>
    </section>
  );
}