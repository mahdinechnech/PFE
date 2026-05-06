"use client";

import { motion } from "framer-motion";
import { 
  Droplets, 
  Zap, 
  Snowflake, 
  Palette, 
  BrickWall, 
  Sparkles, 
  Flower2, 
  Truck, 
  Hammer, 
  Baby, 
  Leaf, 
  Wrench,
  ArrowRight
} from "lucide-react";

// Categories
const categories = [
  { name: "Plomberie", icon: <Droplets size={24} /> },
  { name: "Electricité", icon: <Zap size={24} /> },
  { name: "Climatisation", icon: <Snowflake size={24} /> },
  { name: "Peinture", icon: <Palette size={24} /> },
  { name: "Maçonnerie", icon: <BrickWall size={24} /> },
  { name: "Ménage", icon: <Sparkles size={24} /> },
  { name: "Beauté", icon: <Flower2 size={24} /> },
  { name: "Livraison", icon: <Truck size={24} /> },
  { name: "Charpenterie", icon: <Hammer size={24} /> },
  { name: "Baby sitting", icon: <Baby size={24} /> },
  { name: "Jardinage", icon: <Leaf size={24} /> },
];

// Generate 6 annonces per category
const generateServices = (category) =>
  [
    "Intervention rapide",
    "À domicile",
    "Professionnel",
    "Pas cher",
    "Urgence",
    "Sur devis",
  ].map((type) => ({
    title: `${category} ${type}`,
    description: `Service de ${category.toLowerCase()} - ${type.toLowerCase()}.`,
    icon: categories.find((c) => c.name === category)?.icon || <Wrench size={24} />,
  }));

export default function CategoriesByRow() {
  return (
    <section id="services">
      <div className="relative  py-8 overflow-hidden  bg-[#eee8e0]">
        <motion.div
          className="flex gap-10 "
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {/* duplicate list for infinite effect */}
          {[...categories, ...categories].map((cat, index) => (
            <div
              key={index}
              className="flex flex-col items-center min-w-25 group border-amber-500"
            >
              <div className="w-25 h-20 rounded-full bg-[#d5cebf77] flex items-center justify-center text-3xl group-hover:scale-110 transition">
                {cat.icon}
              </div>
              <p className=" text-sm text-amber-500 group-hover:text-white">
                {cat.name}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <h2 className="text-3xl font-bold text-gray-800">
          Nos services par catégorie
        </h2>

        {categories.map((cat, i) => {
          const services = generateServices(cat.name);

          return (
            <div key={i} className="space-y-3 ">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-700">
                    {cat.name}
                  </h3>
                </div>

                <button className="flex items-center gap-1 text-xs px-3 py-1 border border-orange-500 text-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition cursor-pointer">
                  <span>Voir plus</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* 6 CARDS IN ONE ROW */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-6 gap-3  "
              >
                {services.map((service, idx) => (
                  <div
                    key={idx}
                    className="
                      bg-[#4b463d]
                      text-white
                      rounded-xl
                      p-3
                      text-center
                      shadow-md
                      hover:scale-105
                      transition
                    "
                  >
                    <div className="text-xl mb-1">{service.icon}</div>

                    <h4 className="text-xs font-semibold">{service.title}</h4>

                    <p className="text-[10px] text-gray-300 mt-1">
                      {service.description}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
