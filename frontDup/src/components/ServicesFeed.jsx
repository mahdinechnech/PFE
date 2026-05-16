import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, User, ShieldCheck } from "lucide-react";

export default function ServicesFeed() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="py-12 text-center text-gray-500">
        Chargement des services...
      </div>
    );

  return (
    <section className="py-12 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 flex justify-center items-center gap-3">
            <ShieldCheck className="text-orange-500" />
            Services Disponibles
          </h2>
          <p className="text-gray-500 mt-2">
            Trouvez le technicien idéal pour vos besoins
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-orange-100 text-orange-600 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                  {service.category}
                </span>
                <span className="text-gray-400 text-[10px] flex items-center gap-1">
                  <Clock size={12} />{" "}
                  {new Date(service.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {service.description}
              </p>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <DollarSign size={16} className="text-green-500" />
                  <span>{service.price} DA</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin size={16} className="text-red-500" />
                  <span className="truncate">{service.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mt-3 bg-gray-50 p-2 rounded-lg">
                  <User size={14} />
                  <span>
                    Proposé par: <strong>{service.creator?.username}</strong>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">
              Aucun service disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
