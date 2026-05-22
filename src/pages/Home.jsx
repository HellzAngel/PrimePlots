import { useEffect, useState } from 'react';
import { MessageCircle, MapPin, Maximize, Home as HomeIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../components/Loader';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);

    const fetchProperties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        const props = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        props.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setProperties(props);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedProp) {
      setCurrentImageIdx(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedProp]);

  const getWhatsAppLink = (title) => {
    const message = `Hi, I'm interested in the property: ${title}. Could you provide more details?`;
    return `https://wa.me/917560953886?text=${encodeURIComponent(message)}`;
  };

  const getImages = (prop) => prop.images && prop.images.length > 0 ? prop.images : (prop.image ? [prop.image] : []);

  const nextImage = (e) => {
    e.stopPropagation();
    if (!selectedProp) return;
    const images = getImages(selectedProp);
    setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (!selectedProp) return;
    const images = getImages(selectedProp);
    setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (loading) return <Loader />;

  return (
    <div className="container max-w-7xl mx-auto px-4 pb-12 mt-4 md:mt-8">
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 dark:from-emerald-400 dark:via-teal-200 dark:to-emerald-400 bg-[length:200%_auto] animate-text-shimmer mb-4 tracking-tight">
          Find Your Dream Property
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Browse our exclusive collection of premium real estate, carefully curated for your ultimate lifestyle.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="glass-card text-center py-20 px-4 max-w-2xl mx-auto animate-fade-in">
          <HomeIcon size={64} className="text-emerald-200 dark:text-emerald-800 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-2">No properties available yet</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">We are currently updating our catalog. Please check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop, index) => {
            const images = getImages(prop);
            return (
              <div key={prop.id} className="glass-card group cursor-pointer" style={{ animationDelay: `${index * 50}ms` }} onClick={() => setSelectedProp(prop)}>
                {images.length > 0 && (
                  <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img src={images[0]} alt={prop.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-slate-800 dark:text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
                        1/{images.length}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1 mb-1">{prop.title}</h3>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-4">₹{prop.price}</div>
                  <div className="flex flex-wrap gap-3 text-sm mb-4">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full font-medium">
                      <MapPin size={14} className="text-emerald-500" /> {prop.location}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full font-medium">
                      <Maximize size={14} className="text-emerald-500" /> {prop.area}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">{prop.description}</p>
                  <button className="btn w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold">
                    View Full Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Details Pop-up Modal */}
      {selectedProp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedProp(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in-up flex flex-col md:flex-row relative" onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setSelectedProp(null)} className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-800 dark:text-white p-2 rounded-full hover:bg-white dark:hover:bg-slate-600 hover:scale-110 hover:text-rose-500 transition-all shadow-md">
              <X size={24} />
            </button>

            {/* Image Gallery */}
            <div className="md:w-1/2 relative bg-slate-100 dark:bg-slate-700 flex flex-col h-64 md:h-auto">
              {getImages(selectedProp).length > 0 ? (
                <>
                  <img src={getImages(selectedProp)[currentImageIdx]} alt={selectedProp.title} className="w-full h-full object-cover" />
                  {getImages(selectedProp).length > 1 && (
                    <>
                      <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <button onClick={prevImage} className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-full shadow-md text-slate-800 dark:text-white hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-600 transition-all">
                          <ChevronLeft size={24} />
                        </button>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <button onClick={nextImage} className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-full shadow-md text-slate-800 dark:text-white hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-600 transition-all">
                          <ChevronRight size={24} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                        {getImages(selectedProp).map((_, idx) => (
                          <div key={idx} className={`h-2 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white w-4' : 'bg-white/50 w-2'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400"><HomeIcon size={64} /></div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">{selectedProp.title}</h2>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-6">₹{selectedProp.price}</div>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full text-emerald-600 dark:text-emerald-400"><MapPin size={24} /></div>
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Location</div>
                    <div className="font-semibold text-slate-800 dark:text-white">{selectedProp.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full text-emerald-600 dark:text-emerald-400"><Maximize size={24} /></div>
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Area</div>
                    <div className="font-semibold text-slate-800 dark:text-white">{selectedProp.area}</div>
                  </div>
                </div>
              </div>

              <div className="mb-8 flex-grow">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-3">About this Property</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedProp.description}</p>
              </div>

              <a href={getWhatsAppLink(selectedProp.title)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full py-4 text-lg mt-auto shadow-xl">
                <MessageCircle size={24} /> Contact Owner on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
