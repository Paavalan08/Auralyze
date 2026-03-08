import { useState, useRef, useEffect } from 'react';

function Profile({ userEmail, onProfileUpdate }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); 
  
  const [bannerUrl, setBannerUrl] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          if (data.avatar) setAvatarUrl(data.avatar);
          if (data.banner) setBannerUrl(data.banner);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const displayFirst = firstName || (userEmail ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1) : 'Explorer');
  const displayLast = lastName || '';
  const fullName = `${displayFirst} ${displayLast}`.trim();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMessage(null); 
    
    try {
      const res = await fetch('http://127.0.0.1:5000/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ firstName, lastName, avatar: avatarUrl, banner: bannerUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setShowSuccess(true);
        if (onProfileUpdate) onProfileUpdate(); 
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrorMessage(data.error || "Server rejected the update.");
      }
    } catch (err) {
      setErrorMessage("Network error. Make sure your Flask backend is running.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageChange = (e, setter, isBanner = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = isBanner ? 1200 : 400;
        const MAX_HEIGHT = isBanner ? 600 : 400;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setter(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // CHANGED: The function to permanently delete the user's history
  const handleClearData = async () => {
    const confirmDelete = window.confirm("WARNING: This will permanently delete all your Auralyze scan history. This action cannot be undone. Do you wish to proceed?");
    if (!confirmDelete) return;

    try {
      const res = await fetch('http://127.0.0.1:5000/history/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert("Your history has been completely wiped.");
        window.location.reload(); // Instantly reload to show the empty table
      } else {
        alert("Failed to delete data. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin"></div></div>;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 ease-out pb-10">
      <div className="mb-8 pl-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile & Settings</h1>
        <p className="mt-1 text-slate-500 font-medium">Manage your personal information, identity, and account security.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white overflow-hidden">
        
        <div className="h-48 w-full relative overflow-hidden group cursor-pointer" onClick={() => bannerInputRef.current.click()}>
          <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setBannerUrl, true)} />
          {bannerUrl ? <img src={bannerUrl} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-r from-sky-400 via-blue-500 to-purple-600"></div>}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full border border-white/40 text-white font-bold backdrop-blur-md shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              Update Cover
            </div>
          </div>
        </div>

        <div className="px-8 sm:px-12 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-20 mb-12 relative z-30">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              
              <div className="w-36 h-36 rounded-[2rem] bg-white p-2 shadow-xl shadow-slate-200/50 rotate-3 transition-transform hover:rotate-0 duration-300 group cursor-pointer relative" onClick={() => avatarInputRef.current.click()}>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setAvatarUrl, false)} />
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-5xl font-black overflow-hidden relative">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : displayFirst.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center z-20">
                    <svg className="w-8 h-8 text-white mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                </div>
              </div>
              
              <div className="pb-3">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{fullName}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full uppercase tracking-widest shadow-sm border border-sky-200/50">Academic Tier</span>
                  <span className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div> Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 mb-10" />

          {errorMessage && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
               <p className="font-bold text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-4 space-y-2">
               <h3 className="text-lg font-extrabold text-slate-900 mb-2">Personal Details</h3>
               <p className="text-slate-500 text-sm font-medium leading-relaxed">Update your identity and how your name is displayed across the Auralyze OS workspace.</p>
             </div>
             <div className="lg:col-span-8">
               <form onSubmit={handleUpdate} className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                     <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 transition-all font-bold text-slate-700 shadow-inner" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                     <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 transition-all font-bold text-slate-700 shadow-inner" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Locked)</label>
                   <input type="email" disabled value={userEmail} className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-100/50 text-slate-400 font-bold cursor-not-allowed" />
                 </div>
                 <div className="pt-4 flex items-center justify-end gap-4">
                   {showSuccess && <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">Profile Updated!</span>}
                   <button type="submit" disabled={isUpdating} className={`px-8 py-3.5 rounded-xl font-bold text-white transition-all shadow-md ${isUpdating ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-xl'}`}>
                     {isUpdating ? 'Saving Data...' : 'Update Profile'}
                   </button>
                 </div>
               </form>
             </div>
          </div>
          
          <hr className="border-slate-100 my-10" />

          {/* DANGER ZONE (Now functional!) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-4 space-y-2">
               <h3 className="text-lg font-extrabold text-red-600 mb-2">Danger Zone</h3>
               <p className="text-slate-500 text-sm font-medium leading-relaxed">
                 Permanently delete your account data and scan history. This action cannot be undone.
               </p>
             </div>
             <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4 items-start pt-2">
                <button className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                  Change Password
                </button>
                {/* CHANGED: Connected handleClearData to the button */}
                <button 
                  onClick={handleClearData}
                  className="w-full sm:w-auto px-6 py-3.5 bg-red-50 border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                >
                  Delete Account Data
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;