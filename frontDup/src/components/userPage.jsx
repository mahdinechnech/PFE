import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "./contact";
import { Menu, Star, ShoppingCart } from "lucide-react";

const wilayas = [
  "Alger",
  "Oran",
  "Blida",
  "Constantine",
  "Chlef",
  "Annaba",
  "Setif",
  "Tlemcen",
  "Bejaia",
  "Sidi Bel Abbes",
  "Batna",
  "Tizi Ouzou",
  "Skikda",
  "Biskra",
  "Tiaret",
  "Bechar",
  "Jijel",
  "Guelma",
  "Medea",
  "Mostaganem",
  "Ouargla",
  "Relizane",
  "Naama",
  "Tindouf",
  "Tipaza",
  "M'Sila",
  "Ain Defla",
  "Tamanghasset",
  "Saida",
  "Ghriss",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Illizi",
  "Bordj Bou Arreridj",
  "Boumerdes",
  "El Tarf",
  "Mila",
  "Adrar",
  "Tissemsilt",
  "El Bayadh",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El Meniaa",
];
const categories = [
  "Beauté",
  "Plomberie",
  "Électricité",
  "Peinture",
  "Mécanique",
];

const mockAnnonces = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  title: "Service professionnel " + (i + 1),
  price: Math.floor(Math.random() * 9000 + 1000),
  wilaya: wilayas[i % wilayas.length],
  category: categories[i % categories.length],
  rating: (Math.random() * 5).toFixed(1),
  date: new Date(Date.now() - i * 8000000),
}));

export default function UserPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [myList, setMyList] = useState([]);

  const [filters, setFilters] = useState({
    min: "",
    max: "",
    wilaya: "",
    category: "",
  });

  const [sortBy, setSortBy] = useState("recent");

  // Add to list
  const addToList = (item) => {
    if (!myList.find((i) => i.id === item.id)) {
      setMyList([...myList, item]);
    }
  };

  // FILTER
  let data = mockAnnonces.filter(
    (a) =>
      (!filters.min || a.price >= filters.min) &&
      (!filters.max || a.price <= filters.max) &&
      (!filters.wilaya || a.wilaya === filters.wilaya) &&
      (!filters.category || a.category === filters.category),
  );

  // SORT
  if (sortBy === "recent") data.sort((a, b) => b.date - a.date);
  if (sortBy === "old") data.sort((a, b) => a.date - b.date);
  if (sortBy === "rating") data.sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        showLinks={false}
        showAuth={false}
        showSidebar={false}
        showCreate={false}
      />

      {/* Top controls */}
      <div className="pt-24 px-6 flex justify-between items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600"
        >
          <Menu size={20} />
          <span>Filtres</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-gray-600 font-medium">Trier par</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="recent">Récent</option>
            <option value="old">Plus ancien</option>
            <option value="rating">Notation</option>
          </select>
        </div>
      </div>

      {/* overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-xl transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-5 border-b">
          <h2 className="text-lg font-bold text-orange-500">Filtres</h2>
        </div>

        <div className="p-5 space-y-4">
          <input
            type="number"
            placeholder="Prix min"
            value={filters.min}
            onChange={(e) => setFilters({ ...filters, min: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Prix max"
            value={filters.max}
            onChange={(e) => setFilters({ ...filters, max: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <select
            value={filters.wilaya}
            onChange={(e) => setFilters({ ...filters, wilaya: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">Toutes les wilayas</option>
            {wilayas.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="w-full border p-2 rounded"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="absolute bottom-0 w-full p-5 border-t">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-full bg-orange-500 text-white py-3 rounded-lg"
          >
            Appliquer
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-3 flex-1 cursor-pointer"
          >
            <div className="h-24 bg-gray-200 rounded-lg mb-2"></div>

            <h3 className="font-semibold text-sm">{item.title}</h3>
            <p className="text-xs text-gray-500">{item.category}</p>

            <div className="flex justify-between text-xs mt-2">
              <span>{item.wilaya}</span>
              <div className="flex items-center gap-1 text-orange-500">
                <Star size={14} className="fill-orange-500" />
                <span>{item.rating}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="font-bold text-orange-500">{item.price} DA</span>

              <button
                onClick={() => addToList(item)}
                className="text-orange-500 hover:text-orange-600 transition"
              >
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
