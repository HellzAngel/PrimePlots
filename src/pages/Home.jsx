import { useEffect, useState } from 'react';
import { MessageCircle, MapPin, Maximize, Home as HomeIcon, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Loader from '../components/Loader';
import { supabase } from '../supabase';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProperties = properties.filter(prop => 
    prop.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      const images = getImages(selectedProp);
      setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe) {
      const images = getImages(selectedProp);
      setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);

    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setProperties(data || []);

        // Auto-select property from URL parameter if present
        const params = new URLSearchParams(window.location.search);
        const propId = params.get('property');
        if (propId && data) {
          const found = data.find(p => String(p.id) === String(propId));
          if (found) {
            setSelectedProp(found);
          }
        }
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
      setIsLightboxOpen(false);
      document.body.style.overflow = 'hidden';
      // Sync property ID to URL query parameter
      const url = new URL(window.location.href);
      url.searchParams.set('property', selectedProp.id);
      window.history.replaceState(null, '', url.toString());
    } else {
      setIsLightboxOpen(false);
      document.body.style.overflow = 'auto';
      // Remove property ID from URL query parameter
      const url = new URL(window.location.href);
      if (url.searchParams.has('property')) {
        url.searchParams.delete('property');
        window.history.replaceState(null, '', url.toString());
      }
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedProp]);

  const getWhatsAppLink = (prop) => {
    if (!prop) return '';
    const message = `Hi, I'm interested in the following property listed on PrimePlots:

🏠 *${prop.title}*
💰 *Price:* ₹${prop.price}
📍 *Location:* ${prop.location}
📐 *Area:* ${prop.area}

Could you please provide more details?
Link: ${window.location.origin}/?property=${prop.id}`;
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
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 dark:from-emerald-400 dark:via-teal-200 dark:to-emerald-400 bg-[length:200%_auto] animate-text-shimmer mb-4 tracking-tight">
          Find Your Dream Property
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Browse our exclusive collection of premium real estate, carefully curated for your ultimate lifestyle.
        </p>
        <div className="flex justify-center mt-8">
          <a href="https://wa.me/917560953886?text=Hi!%20I%20would%20like%20to%20share%20details%20of%20my%20property%20to%20be%20listed%20on%20PrimePlots." target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp py-3 px-6 sm:px-8 text-base sm:text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
            <MessageCircle size={24} /> List Your Property via WhatsApp
          </a>
        </div>
      </div>

      {properties.length > 0 && (
        <div className="max-w-xl mx-auto mb-12 animate-fade-in px-2">
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-md px-4 py-1.5 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all duration-300">
            <div className="text-slate-400 dark:text-slate-500 pl-2">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by location (e.g. Kochi, Calicut)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 px-3 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 outline-none text-base font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 mr-1 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="glass-card text-center py-20 px-4 max-w-2xl mx-auto animate-fade-in">
          <HomeIcon size={64} className="text-emerald-200 dark:text-emerald-800 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-2">No properties available yet</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">We are currently updating our catalog. Please check back soon!</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="glass-card text-center py-16 px-4 max-w-md mx-auto animate-fade-in">
          <MapPin size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">No listings in "{searchQuery}"</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Try searching for another location or check your spelling.</p>
          <button onClick={() => setSearchQuery('')} className="btn bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold py-2 px-6">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((prop, index) => {
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedProp(null)}>
          <div className="bg-white dark:bg-slate-800 w-full sm:max-w-5xl sm:mx-4 rounded-t-[2rem] sm:rounded-[2rem] max-h-[92vh] overflow-y-auto shadow-2xl animate-fade-in-up flex flex-col md:flex-row relative" onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setSelectedProp(null)} className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-800 dark:text-white p-2 rounded-full hover:bg-white dark:hover:bg-slate-600 hover:scale-110 hover:text-rose-500 transition-all shadow-md">
              <X size={24} />
            </button>

            {/* Image Gallery */}
            <div 
              className="md:w-1/2 relative bg-slate-100 dark:bg-slate-700 flex-shrink-0 h-56 sm:h-72 md:h-auto cursor-zoom-in group/gallery"
              onClick={() => setIsLightboxOpen(true)}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {getImages(selectedProp).length > 0 ? (
                <>
                  <img src={getImages(selectedProp)[currentImageIdx]} alt={selectedProp.title} className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-90" />
                  
                  {/* Zoom Indicator Icon */}
                  <div className="absolute top-4 left-4 z-10 bg-slate-900/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-slate-900 transition-all shadow-md">
                    <Maximize size={18} />
                  </div>

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
                <div className="w-full h-full flex items-center justify-center text-slate-400" onClick={e => e.stopPropagation()}><HomeIcon size={64} /></div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mb-2">{selectedProp.title}</h2>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-4 sm:mb-6">₹{selectedProp.price}</div>

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

              <a href={getWhatsAppLink(selectedProp)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full py-4 text-lg mt-auto shadow-xl">
                <MessageCircle size={24} /> Contact Owner on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && selectedProp && getImages(selectedProp).length > 0 && (
        <div 
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-955/95 backdrop-blur-md animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button 
            onClick={() => setIsLightboxOpen(false)} 
            className="absolute top-6 right-6 z-50 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 hover:scale-110 transition-all shadow-lg"
          >
            <X size={28} />
          </button>

          {/* Image container */}
          <div 
            className="relative w-full max-w-5xl px-4 flex items-center justify-center select-none" 
            onClick={e => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img 
              src={getImages(selectedProp)[currentImageIdx]} 
              alt={selectedProp.title} 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />

            {/* Navigation Arrows in Lightbox */}
            {getImages(selectedProp).length > 1 && (
              <>
                <button 
                  onClick={prevImage} 
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full shadow-lg transition-all hidden sm:block"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={nextImage} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full shadow-lg transition-all hidden sm:block"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Info Bar */}
          <div className="mt-6 flex flex-col items-center gap-2 text-center px-4" onClick={e => e.stopPropagation()}>
            <span className="text-white font-semibold text-lg">{selectedProp.title}</span>
            {getImages(selectedProp).length > 1 && (
              <span className="text-slate-400 font-medium text-sm">
                {currentImageIdx + 1} of {getImages(selectedProp).length}
              </span>
            )}
            {/* Mobile swipe helper */}
            <span className="text-slate-500 text-xs sm:hidden mt-1">Swipe left/right to navigate</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
