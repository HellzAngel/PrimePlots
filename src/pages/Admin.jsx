import { useState, useEffect } from 'react';
import { PlusCircle, Image as ImageIcon, Loader, Edit2, Trash2, LogOut, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [properties, setProperties] = useState([]);
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [formData, setFormData] = useState({ title: '', price: '', location: '', area: '', description: '', images: [] });

  useEffect(() => {
    if (!localStorage.getItem('admin_auth')) { navigate('/login'); return; }
    loadProperties();
  }, [navigate]);

  const loadProperties = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "properties"));
      const props = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      props.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setProperties(props);
    } catch (error) {
      console.error("Error fetching properties:", error);
      alert("Failed to load properties. Ensure Firestore is set up correctly.");
    } finally { setFetching(false); }
  };

  const handleLogout = () => { localStorage.removeItem('admin_auth'); navigate('/login'); };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (formData.images.length + files.length > 3) { alert('Max 3 photos allowed.'); return; }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let [width, height] = [img.width, img.height];
          const MAX = 1200;
          if (width > height ? width > MAX : height > MAX) {
            if (width > height) { height *= MAX / width; width = MAX; }
            else { width *= MAX / height; height = MAX; }
          }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, images: [...prev.images, dataUrl] }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const uploadImagesToFirebase = async (imagesArray) => {
    const urls = [];
    for (let i = 0; i < imagesArray.length; i++) {
      const img = imagesArray[i];
      if (img.startsWith('http')) { urls.push(img); continue; }
      const imageRef = ref(storage, `properties/${Date.now()}_${i}.jpg`);
      await uploadString(imageRef, img, 'data_url');
      urls.push(await getDownloadURL(imageRef));
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) { alert('Please upload at least 1 image.'); return; }
    setLoading(true);
    try {
      const finalImageUrls = await uploadImagesToFirebase(formData.images);
      const propertyData = { ...formData, images: finalImageUrls, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(doc(db, "properties", editingId), propertyData);
      } else {
        await addDoc(collection(db, "properties"), { ...propertyData, createdAt: serverTimestamp() });
      }
      await loadProperties();
      setView('list');
    } catch (err) {
      console.error(err);
      alert('Failed to save. Check Firebase configuration.');
    } finally { setLoading(false); }
  };

  const handleEdit = (prop) => {
    setFormData({ title: prop.title, price: prop.price, location: prop.location, area: prop.area, description: prop.description, images: prop.images || [] });
    setEditingId(prop.id);
    setView('form');
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    try {
      await deleteDoc(doc(db, "properties", deleteModalId));
      setProperties(properties.filter(p => p.id !== deleteModalId));
    } catch (err) { alert("Failed to delete."); }
    finally { setDeleteModalId(null); }
  };

  const openForm = () => {
    setFormData({ title: '', price: '', location: '', area: '', description: '', images: [] });
    setEditingId(null);
    setView('form');
  };

  if (view === 'list') return (
    <div className="container max-w-7xl mx-auto px-4 mt-12 md:mt-16 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your real estate listings</p>
        </div>
        <div className="flex gap-4">
          <button onClick={openForm} className="btn btn-primary"><PlusCircle size={20} /> Add Property</button>
          <button onClick={handleLogout} className="btn btn-glass"><LogOut size={20} /> Logout</button>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-emerald-600" size={48} /></div>
      ) : properties.length === 0 ? (
        <div className="glass-card text-center py-20 px-4">
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2">No Properties Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Start by adding your first real estate listing.</p>
          <button onClick={openForm} className="btn btn-primary"><PlusCircle size={20} /> Add Property</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map(prop => {
            const displayImage = prop.images?.[0] || null;
            return (
              <div key={prop.id} className="glass-card">
                {displayImage && (
                  <div className="relative h-56 overflow-hidden group bg-slate-100 dark:bg-slate-700">
                    <img src={displayImage} alt={prop.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button onClick={() => handleEdit(prop)} className="bg-white dark:bg-slate-800 p-3 rounded-full text-emerald-600 hover:scale-110 transition-transform shadow-xl"><Edit2 size={20} /></button>
                      <button onClick={() => setDeleteModalId(prop.id)} className="bg-white dark:bg-slate-800 p-3 rounded-full text-rose-500 hover:scale-110 transition-transform shadow-xl"><Trash2 size={20} /></button>
                    </div>
                    {prop.images?.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-slate-900/70 text-white text-xs px-2 py-1 rounded-md font-medium">{prop.images.length} Photos</div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 truncate text-slate-800 dark:text-white">{prop.title}</h3>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold mb-2 text-lg">₹{prop.price}</div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{prop.location} • {prop.area}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-fade-in-up border border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-6 mx-auto"><Trash2 size={32} /></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-2">Delete Property?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8">This action cannot be undone. This listing will be permanently removed.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setDeleteModalId(null)} className="px-6 py-3 rounded-full font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-6 py-3 rounded-full font-semibold bg-rose-500 text-white hover:bg-rose-600 hover:-translate-y-0.5 transition-all shadow-md">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto px-4 mt-8 pb-12">
      <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors font-medium">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>
      <div className="glass-card p-6 md:p-10">
        <h2 className="text-3xl font-extrabold mb-8 flex items-center gap-3 text-slate-800 dark:text-white tracking-tight">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-xl"><PlusCircle className="text-emerald-600 dark:text-emerald-400" size={28} /></div>
          {editingId ? 'Edit Property' : 'Add New Property'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Property Title</label>
              <input type="text" className="form-control" required placeholder="e.g. Modern Villa in Suburbs" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Price (₹)</label>
              <input type="text" className="form-control" required placeholder="e.g. 75,00,000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Location</label>
              <input type="text" className="form-control" required placeholder="e.g. Kochi, Kerala" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Total Area</label>
              <input type="text" className="form-control" required placeholder="e.g. 10 Cents / 2400 sq.ft" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Property Description</label>
            <textarea className="form-control h-32 resize-y" required placeholder="Describe the property in detail..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="form-label mb-0">Photos (Max 3)</label>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{formData.images.length}/3 Uploaded</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 group shadow-sm bg-slate-100 dark:bg-slate-700">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 text-rose-500 p-1.5 rounded-full shadow-md hover:scale-110 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {formData.images.length < 3 && (
                <div className="h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-emerald-400 transition-colors text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  onClick={() => document.getElementById('imageUpload').click()}>
                  <ImageIcon size={32} className="mb-2" />
                  <span className="font-medium text-sm">Add Photo</span>
                  <input id="imageUpload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </div>
              )}
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" className="btn btn-primary w-full shadow-lg py-4 text-lg" disabled={loading}>
              {loading ? <Loader className="animate-spin mx-auto" /> : (editingId ? 'Update Property' : 'Publish Property')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
