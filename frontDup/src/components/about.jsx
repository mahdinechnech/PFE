"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function PourquoiNous() {
  return (
    <section className=" py-20 px-6 md:px-20" id="about">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

        {/* LEFT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1"
        >
          <motion.img
            src="/public/about.jpg"
            alt="Pourquoi nous"
            className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
            animate={{
              y: [0, -10, 0], // small float effect
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* RIGHT TEXT */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex-1"
        >
          <span className="text-orange-500 font-semibold">
            Pourquoi nous choisir ?
          </span>

          <h2 className="text-4xl font-bold text-[#4b463d] mt-3 mb-6">
            Des services rapides, fiables et proches de vous
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Nous connectons les particuliers aux meilleurs professionnels
            de leur région en quelques clics. Notre objectif est simple :
            vous faire gagner du temps et vous offrir un service de qualité.
          </p>

          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-2">
              <Check className="text-orange-500" size={18} />
              <span>Intervention rapide à domicile</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-orange-500" size={18} />
              <span>Professionnels vérifiés</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-orange-500" size={18} />
              <span>Prix transparents</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-orange-500" size={18} />
              <span>Support 7j/7</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}