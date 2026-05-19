"use client";

import { useState } from "react";


export default function Footer() {
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Comment:", comment);

    setEmail("");
    setComment("");
  }
  return (
    <footer className="bg-[#3f3b35] text-white py-12 px-6 md:px-20 mt-20" id="contact">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">

        {/* LEFT LINKS */}
        <div className="flex flex-col gap-3">

          <h3 className="text-lg font-semibold mb-2 text-orange-300">
            Informations
          </h3>

          <a
            href="/politique-confidentialite"
            className="text-sm text-gray-300 hover:text-white transition"
          >
            Politique et Confidentialité
          </a>

          <a
            href="/comment-annoncer"
            className="text-sm text-gray-300 hover:text-white transition"
          >
            Comment annoncer
          </a>

          <a
            href="/aide"
            className="text-sm text-gray-300 hover:text-white transition"
          >
            Centre d’aide
          </a>

        </div>

        {/* RIGHT EMAIL SECTION */}
        <div className="w-full md:w-[320px]">

         

<form onSubmit={handleSubmit} className="w-full md:w-[320px]">

      <h3 className="text-lg font-semibold mb-3 text-orange-300">
        Laisser un commentaire
      </h3>

      {/* EMAIL */}
      <input
        type="email"
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="
          w-full mb-3
          px-4 py-2
          rounded-lg
          bg-[#2f2c27]
          text-white
          outline-none
          border border-gray-600
          focus:border-orange-400
        "
      />

      {/* COMMENT */}
      <textarea
        placeholder="Votre commentaire..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows="3"
        className="
          w-full mb-3
          px-4 py-2
          rounded-lg
          bg-[#2f2c27]
          text-white
          outline-none
          border border-gray-600
          focus:border-orange-400
          resize-none
        "
      />

      {/* BUTTON */}
      <button
        type="submit"
        className="
          w-full
          bg-orange-500
          hover:bg-orange-600
          text-white
          py-2
          rounded-lg
          transition
        "
      >
        Envoyer
      </button>

    </form>
        </div>

      </div>

      {/* BOTTOM LINE */}
      <div className="text-center text-xs text-gray-400 mt-10">
        © {new Date().getFullYear()} VotreService. Tous droits réservés.
      </div>

    </footer>
  );
}