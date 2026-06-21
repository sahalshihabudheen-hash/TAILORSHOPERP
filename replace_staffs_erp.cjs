const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf(") : currentUser?.role === 'Owner' && currentUser?.id === 'TAILOR-OWNER-MASTER' && ownerTab === 'staffs_erp' ? (");
if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

const endIndex = content.indexOf(") : currentUser?.role === 'Owner' && ownerTab === 'customer_patrons' ? (");
if (endIndex === -1) {
    console.error("Could not find end index");
    process.exit(1);
}

const originalPart = content.substring(startIndex, endIndex);

const newPart = `) : currentUser?.role === 'Owner' && currentUser?.id === 'TAILOR-OWNER-MASTER' && ownerTab === 'staffs_erp' ? (
             /* Tailor users logins page */
             <div className="space-y-6 fade-in font-sans">
               <div className="border-b border-stone-200 dark:border-slate-800 pb-4">
                 <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
                   <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Scissors className="h-4.5 w-4.5" /></span>
                   <span>Manage Tailor Shop Owners &amp; Staff Logins</span>
                 </h2>
                 <p className="text-xs text-stone-400 mt-1">Admin Dashboard: Register new tailor shop owners, define default credentials, and manage active workshop studios.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 {/* Left Side: Existing logins list */}
                 <div className={\`p-5 rounded-2xl border \${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}\`}>
                   <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4 flex items-center gap-1.5 justify-between">
                     <span>Active Shop Owners / Tailors</span>
                     <div className="flex items-center space-x-2 shrink-0">
                       <span className="text-[10px] bg-amber-600/10 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                         {getRegisteredTailors().length} Active
                       </span>
                       <button
                         type="button"
                         onClick={() => {
                           setAdminConfiguringTailorId(null);
                           triggerToast('Switched to Shop Owner Account Registration form!', 'info');
                         }}
                         className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-2.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer flex items-center space-x-1 shadow-sm"
                       >
                         <Plus className="h-3 w-3" />
                         <span>Add New Shop</span>
                       </button>
                     </div>
                   </h3>
                   <div className="space-y-3">
                      {getRegisteredTailors().map((t: any) => {
                        const isConfiguringThisTailor = adminConfiguringTailorId === t.id;
                        return (
                          <div key={t.id} className={\`p-4 rounded-xl border flex flex-col gap-3 transition-all \${
                            isConfiguringThisTailor 
                              ? 'ring-2 ring-amber-500 bg-amber-500/5 dark:bg-zinc-950 border-amber-500' 
                              : 'dark:bg-slate-950 bg-stone-50 border-stone-150 border-slate-900'
                          } text-left\`}>
                            <div className="flex justify-between items-start gap-2 w-full">
                              <div className="space-y-1 text-left">
                                <div className="font-extrabold text-xs text-stone-850 dark:text-white flex items-center gap-2">
                                  <span>{t.name}</span>
                                  {t.hasRegisteredShop ? (
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Shop Profile Set</span>
                                  ) : (
                                    <span className="text-[9px] bg-amber-500/10 text-[#c29910] dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">Pending Shop Setup</span>
                                  )}
                                </div>
                                <div className="text-[10.5px] text-stone-500 space-y-0.5 font-semibold font-sans font-medium">
                                  <p><span className="font-mono text-[9px] text-stone-400">Email:</span> {t.email}</p>
                                  <p><span className="font-mono text-[9px] text-stone-400">Phone:</span> {t.phone || 'N/A'}</p>
                                  <p><span className="font-mono text-[9px] text-stone-400">Room:</span> {t.location || 'N/A'}</p>
                                  {t.shopName && <p><span className="font-mono text-[9px] text-stone-400">Shop:</span> {t.shopName}</p>}
                                  <p className="text-[10.5px] font-mono text-amber-605 dark:text-amber-400 p-1 bg-amber-600/5 rounded inline-block mt-1">PSWD: {t.password}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1.5 shrink-0">
                                {/* Setup/Edit Shop actions */}
                                {t.hasRegisteredShop ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdminConfiguringTailorId(t.id);
                                      setAdminShopName(t.shopName || '');
                                      setAdminOwnerName(t.name);
                                      setAdminShopPhone(t.phone || '');
                                      setAdminShopCountry('India');
                                      setAdminShopState('');
                                      setAdminShopDistrict('');
                                      setAdminShopArea(t.location || '');
                                      setAdminShopPincode('');
                                      setAdminLatitude(t.coordinateLatitude || '');
                                      setAdminLongitude(t.coordinateLongitude || '');
                                      setAdminLogoUrl(t.logoUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop');
                                      triggerToast(\`Editing shop details for \${t.name}\`, 'info');
                                    }}
                                    className="text-[10px] bg-amber-500/10 hover:bg-amber-500/25 text-[#cf9b00] dark:text-amber-400 font-extrabold px-2.5 py-1.5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition active:scale-95 cursor-pointer flex items-center space-x-1 shadow-sm"
                                    title="Edit Shop Workstation details"
                                  >
                                    <Settings className="h-3 w-3" />
                                    <span>Edit Shop</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdminConfiguringTailorId(t.id);
                                      setAdminShopName(\`\${t.name}'s Bespoke TAILORSHOP ERP\`);
                                      setAdminOwnerName(t.name);
                                      setAdminShopPhone(t.phone || '');
                                      setAdminShopCountry('India');
                                      setAdminShopState('');
                                      setAdminShopDistrict('');
                                      setAdminShopArea('');
                                      setAdminShopPincode('');
                                      setAdminLatitude('');
                                      setAdminLongitude('');
                                      setAdminLogoUrl('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop');
                                      triggerToast(\`Setting up active shop profile for \${t.name}\`, 'info');
                                    }}
                                    className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-1.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition active:scale-95 cursor-pointer flex items-center space-x-1 shadow-sm"
                                  >
                                    <Plus className="h-3 w-3" />
                                    <span>Setup Shop</span>
                                  </button>
                                )}

                                {confirmRemoveTailorId === t.id ? (
                                  <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/25 rounded-lg p-1 animate-fadeIn">
                                    <span className="text-[9px] text-red-500 font-extrabold px-1.5 select-none font-sans">Delete?</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const filtered = getRegisteredTailors().filter((x) => x.id !== t.id);
                                        saveRegisteredTailors(filtered);
                                        setRegisteredTailors(filtered);
                                        triggerToast('Removed shop owner credentials!', 'success');
                                        setConfirmRemoveTailorId(null);
                                      }}
                                      className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold cursor-pointer"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmRemoveTailorId(null)}
                                      className="px-2 py-0.5 rounded bg-stone-500 dark:bg-stone-750 hover:bg-stone-600 text-white dark:text-stone-200 text-[9px] font-bold cursor-pointer"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={t.id === 'TAILOR-OWNER-MASTER'}
                                    onClick={() => setConfirmRemoveTailorId(t.id)}
                                    className={\`p-2 rounded hover:bg-red-500/10 hover:text-red-500 text-stone-400 cursor-pointer \${t.id === 'TAILOR-OWNER-MASTER' ? 'cursor-not-allowed opacity-30' : ''}\`}
                                    title={\`Remove \${t.name}\`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                 </div>

                 {/* Right Side Columns (Dual-pane / Side-by-side Setup) */}
                 <div className={\`p-5 rounded-2xl border \${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}\`}>
                   {adminConfiguringTailorId ? (
                     <div className="space-y-4 text-left">
                       {(() => {
                         const currentTargetTailor = getRegisteredTailors().find((x) => x.id === adminConfiguringTailorId);
                         return (
                           <>
                             <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3 mb-2">
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-500 font-sans">
                                   Setup Shop Workstation
                                 </span>
                                 <h3 className="text-sm font-extrabold dark:text-white text-stone-900 leading-snug font-sans">
                                   {currentTargetTailor?.name || 'Shop Owner'}
                                 </h3>
                               </div>
                               <button
                                 type="button"
                                 onClick={() => setAdminConfiguringTailorId(null)}
                                 className="text-stone-400 hover:text-stone-600 text-xs font-bold font-mono transition"
                               >
                                 [Cancel]
                               </button>
                             </div>

                             <form
                               onSubmit={(e) => {
                                 e.preventDefault();
                                 if (!adminShopName.trim() || !adminOwnerName.trim() || !adminShopPhone.trim() || !adminShopArea.trim() || !adminShopPincode.trim() || !adminLatitude.trim() || !adminLongitude.trim()) {
                                   triggerToast('All fields (including GPS coordinates) are required to register this tailor shop!', 'error');
                                   return;
                                 }
                                 const formattedAddr = [
                                   adminShopArea.trim(),
                                   adminShopDistrict.trim(),
                                   adminShopState.trim(),
                                   adminShopCountry.trim(),
                                   adminShopPincode.trim() ? \`PIN: \${adminShopPincode.trim()}\` : ''
                                 ].filter(Boolean).join(', ');

                                 const updated = getRegisteredTailors().map((item) => {
                                   if (item.id === adminConfiguringTailorId) {
                                     return {
                                       ...item,
                                       name: adminOwnerName.trim(),
                                       hasRegisteredShop: true,
                                       shopName: adminShopName.trim(),
                                       location: formattedAddr,
                                       phone: adminShopPhone.trim(),
                                       logoUrl: adminLogoUrl.trim() || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop',
                                       coordinateLatitude: adminLatitude.trim(),
                                       coordinateLongitude: adminLongitude.trim()
                                     };
                                   }
                                   return item;
                                 });

                                 saveRegisteredTailors(updated);
                                 setRegisteredTailors(updated);
                                 setAdminConfiguringTailorId(null);
                                 triggerToast(\`TAILORSHOP ERP Shop Workstation "\thistarget" activated successfully!\`, 'success');
                                 addActivity('Admin Register Shop', \`Admin registered shop "\${adminShopName.trim()}" for tailor \${adminOwnerName.trim()}\`, 'Owner', 'TAILORSHOP ERP Master Admin');
                               }}
                               className="space-y-4"
                             >
                               <div className="space-y-1 font-sans">
                                 <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">
                                   Shop / Workstation Name *
                                 </label>
                                 <input
                                   type="text"
                                   value={adminShopName}
                                   onChange={(e) => setAdminShopName(e.target.value)}
                                   className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                   required
                                 />
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                 <div>
                                   <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">
                                     Owner Name *
                                   </label>
                                   <input
                                     type="text"
                                     value={adminOwnerName}
                                     onChange={(e) => setAdminOwnerName(e.target.value)}
                                     className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                     required
                                   />
                                 </div>
                                 <div>
                                   <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">
                                     Store Phone *
                                   </label>
                                   <input
                                     type="text"
                                     value={adminShopPhone}
                                     onChange={(e) => setAdminShopPhone(e.target.value)}
                                     className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                     required
                                   />
                                 </div>
                               </div>

                               {/* Location with Coordinates */}
                               <div className="p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl space-y-3">
                                 <div className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
                                   Address / Location Builder
                                 </div>

                                 <div className="grid grid-cols-2 gap-2">
                                   <div>
                                     <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">Country *</label>
                                     <select
                                       value={adminShopCountry}
                                       onChange={(e) => {
                                         setAdminShopCountry(e.target.value);
                                         setAdminShopState('');
                                         setAdminShopDistrict('');
                                       }}
                                       className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                       required
                                     >
                                       {COUNTRY_LIST.map((c) => (
                                         <option key={c} value={c}>{c}</option>
                                       ))}
                                     </select>
                                   </div>
                                   <div>
                                     <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">State *</label>
                                     {adminShopCountry === 'India' ? (
                                       <select
                                         value={adminShopState}
                                         onChange={(e) => {
                                           setAdminShopState(e.target.value);
                                           setAdminShopDistrict('');
                                         }}
                                         className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                         required
                                       >
                                         <option value="">-- Choose State --</option>
                                         {Object.keys(INDIA_STATES_MAP).map((s) => (
                                           <option key={s} value={s}>{s}</option>
                                         ))}
                                       </select>
                                     ) : (
                                       <input
                                         type="text"
                                         placeholder="State"
                                         value={adminShopState}
                                         onChange={(e) => setAdminShopState(e.target.value)}
                                         className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                         required
                                       />
                                     )}
                                   </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-2">
                                   <div>
                                     <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">District *</label>
                                     {adminShopCountry === 'India' && adminShopState && INDIA_STATES_MAP[adminShopState] ? (
                                       <select
                                         value={adminShopDistrict}
                                         onChange={(e) => setAdminShopDistrict(e.target.value)}
                                         className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                         required
                                       >
                                         <option value="">-- Choose District --</option>
                                         {INDIA_STATES_MAP[adminShopState].map((d) => (
                                           <option key={d} value={d}>{d}</option>
                                         ))}
                                       </select>
                                     ) : (
                                       <input
                                         type="text"
                                         placeholder="District"
                                         value={adminShopDistrict}
                                         onChange={(e) => setAdminShopDistrict(e.target.value)}
                                         className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                         required
                                       />
                                     )}
                                   </div>
                                   <div>
                                     <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">Pincode *</label>
                                     <input
                                       type="text"
                                       placeholder="Pincode"
                                       value={adminShopPincode}
                                       onChange={(e) => setAdminShopPincode(e.target.value)}
                                       className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                       required
                                     />
                                   </div>
                                 </div>

                                 <div>
                                   <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">Shop Landmark / Area *</label>
                                   <input
                                     type="text"
                                     placeholder="Area or Street name"
                                     value={adminShopArea}
                                     onChange={(e) => setAdminShopArea(e.target.value)}
                                     className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                     required
                                   />
                                 </div>

                                 <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/50 dark:border-zinc-800">
                                   <span className="text-[9.5px] font-extrabold text-stone-400 uppercase tracking-wider font-sans">Device coordinates</span>
                                   <button
                                     type="button"
                                     onClick={() => {
                                       const fallbackToIp = async (errMsg) => {
                                         triggerToast('GPS failed. Falling back to Network IP Geolocation...', 'info');
                                         try {
                                           const ipData = await fetchIPLocation();
                                           setAdminLatitude(ipData.latitude);
                                           setAdminLongitude(ipData.longitude);
                                           if (ipData.country) setAdminShopCountry(ipData.country);
                                           
                                           let detectedState = '';
                                           if (ipData.region) {
                                             const findState = Object.keys(INDIA_STATES_MAP).find(
                                               (s) => s.toLowerCase() === ipData.region.toLowerCase() || ipData.region.toLowerCase().includes(s.toLowerCase())
                                             );
                                             if (findState) {
                                               setAdminShopState(findState);
                                               detectedState = findState;
                                             } else {
                                               setAdminShopState(ipData.region);
                                               detectedState = ipData.region;
                                             }
                                           }
                                           if (detectedState && INDIA_STATES_MAP[detectedState] && ipData.city) {
                                             const distList = INDIA_STATES_MAP[detectedState];
                                             const match = distList.find(d => 
                                               d.toLowerCase() === ipData.city.toLowerCase() || 
                                               ipData.city.toLowerCase().includes(d.toLowerCase()) ||
                                               d.toLowerCase().includes(ipData.city.toLowerCase())
                                             );
                                             if (match) {
                                               setAdminShopDistrict(match);
                                             } else {
                                               setAdminShopDistrict(ipData.city);
                                             }
                                           } else if (ipData.city) {
                                             setAdminShopDistrict(ipData.city);
                                           }

                                           if (ipData.postal) setAdminShopPincode(ipData.postal);
                                           setAdminShopArea(ipData.area || 'Central Area');
                                           triggerToast('Admin shop location loaded via IP successfully!', 'success');
                                         } catch (fError) {
                                           console.error("IP fallback error:", fError);
                                           triggerToast(errMsg || fError?.message || 'Network Geolocation failed.', 'error');
                                         } finally {
                                           setAdminLocationLoading(false);
                                         }
                                       };

                                       if (!navigator.geolocation) {
                                         fallbackToIp('Geolocation not supported.');
                                         return;
                                       }
                                       setAdminLocationLoading(true);
                                       triggerToast('Requesting GPS coordinates...', 'info');
                                       navigator.geolocation.getCurrentPosition(
                                         async (pos) => {
                                           const lat = pos.coords.latitude.toFixed(6);
                                           const lon = pos.coords.longitude.toFixed(6);
                                           setAdminLatitude(lat);
                                           setAdminLongitude(lon);
                                           triggerToast('GPS Locked! Fetching shop address details...', 'info');
                                           
                                           try {
                                             const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lon}\`, {
                                               headers: { 'Accept-Language': 'en' }
                                             });
                                             if (res.ok) {
                                               const data = await res.json();
                                               if (data && data.address) {
                                                 const addr = data.address;
                                                 if (addr.country) setAdminShopCountry(addr.country);
                                                 
                                                 let detectedState = '';
                                                 const stateCandidates = [
                                                   addr.state,
                                                   addr.region,
                                                   addr.province,
                                                   addr.state_district
                                                 ].filter(Boolean).map(v => String(v).trim());

                                                 let foundStateKey = '';
                                                 for (const sc of stateCandidates) {
                                                   const match = Object.keys(INDIA_STATES_MAP).find(
                                                     (s) => s.toLowerCase() === sc.toLowerCase() || 
                                                            sc.toLowerCase().includes(s.toLowerCase()) || 
                                                            s.toLowerCase().includes(sc.toLowerCase())
                                                   );
                                                   if (match) {
                                                     foundStateKey = match;
                                                     break;
                                                   }
                                                 }

                                                 if (foundStateKey) {
                                                   setAdminShopState(foundStateKey);
                                                   detectedState = foundStateKey;
                                                 } else if (addr.state) {
                                                   setAdminShopState(addr.state);
                                                   detectedState = addr.state;
                                                 }
                                                 
                                                 let matchedDistrict = '';
                                                 if (detectedState && INDIA_STATES_MAP[detectedState]) {
                                                   const distList = INDIA_STATES_MAP[detectedState];
                                                   const fullTextSearchSource = [
                                                     data.display_name || '',
                                                     addr.state_district || '',
                                                     addr.district || '',
                                                     addr.county || '',
                                                     addr.city || '',
                                                     addr.town || '',
                                                     addr.city_district || '',
                                                     addr.suburb || '',
                                                     addr.village || '',
                                                     addr.neighbourhood || '',
                                                     addr.municipality || '',
                                                     addr.subdistrict || ''
                                                   ].filter(Boolean).map(s => String(s).toLowerCase().trim());

                                                   for (const text of fullTextSearchSource) {
                                                     const match = distList.find(d => {
                                                       const dl = d.toLowerCase();
                                                       return dl === text || text.includes(dl) || dl.includes(text);
                                                     });
                                                     if (match) {
                                                       matchedDistrict = match;
                                                       break;
                                                     }
                                                   }
                                                   
                                                   if (!matchedDistrict && data.display_name) {
                                                     const dispLower = data.display_name.toLowerCase();
                                                     const match = distList.find(d => dispLower.includes(d.toLowerCase()));
                                                     if (match) matchedDistrict = match;
                                                   }
                                                 }

                                                 if (matchedDistrict) {
                                                   setAdminShopDistrict(matchedDistrict);
                                                 } else {
                                                   const districtOrCity = addr.state_district || addr.county || addr.district || addr.city_district || addr.city || addr.town || addr.suburb || '';
                                                   setAdminShopDistrict(districtOrCity);
                                                 }
                                                 
                                                 if (addr.postcode) setAdminShopPincode(addr.postcode);
                                                 
                                                 const street = addr.road || addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || '';
                                                 const areaParts = [street, addr.quarter || ''].filter(Boolean).join(', ');
                                                 if (areaParts) {
                                                   setAdminShopArea(areaParts);
                                                 } else if (data.display_name) {
                                                   const dispParts = data.display_name.split(',');
                                                   setAdminShopArea(dispParts.slice(0, 2).join(',').trim());
                                                 }
                                                 triggerToast('Admin shop address Auto-loaded!', 'success');
                                               }
                                             }
                                           } catch (err) {
                                             console.error("Reverse geocoding error:", err);
                                             triggerToast('GPS coordinates locked!', 'success');
                                           } finally {
                                             setAdminLocationLoading(false);
                                           }
                                         },
                                         (err) => {
                                           console.error(err);
                                           setAdminLocationLoading(false);
                                           fallbackToIp(\`Geolocation failed: \${err.message}\`);
                                         },
                                         { enableHighAccuracy: true, timeout: 6000 }
                                       );
                                     }}
                                     disabled={adminLocationLoading}
                                     className="text-[9.5px] bg-amber-500/10 hover:bg-amber-500/20 text-[#cf9b00] px-2 py-1 rounded-lg border border-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer font-extrabold font-sans"
                                   >
                                     {adminLocationLoading ? 'Locking...' : 'Auto-Locate GPS'}
                                   </button>
                                 </div>

                                 <div className="grid grid-cols-2 gap-2 font-mono">
                                   <input
                                     type="text"
                                     placeholder="Latitude *"
                                     value={adminLatitude}
                                     onChange={(e) => setAdminLatitude(e.target.value)}
                                     className="p-1.5 rounded bg-white text-stone-900 border font-mono text-[11px] focus:outline-none dark:bg-stone-900 dark:text-white dark:border-stone-800"
                                     required
                                   />
                                   <input
                                     type="text"
                                     placeholder="Longitude *"
                                     value={adminLongitude}
                                     onChange={(e) => setAdminLongitude(e.target.value)}
                                     className="p-1.5 rounded bg-white text-stone-900 border font-mono text-[11px] focus:outline-none dark:bg-stone-900 dark:text-white dark:border-stone-800"
                                     required
                                   />
                                 </div>

                                 {adminLatitude && adminLongitude && (
                                   <div className="mt-2 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm h-[130px] w-full relative">
                                     <iframe
                                       title="Admin Google Map Preview"
                                       width="100%"
                                       height="100%"
                                       style={{ border: 0 }}
                                       allowFullScreen={false}
                                       loading="lazy"
                                       referrerPolicy="no-referrer"
                                       src={\`https://maps.google.com/maps?q=\${adminLatitude},\${adminLongitude}&z=15&output=embed\`}
                                     />
                                   </div>
                                 )}
                               </div>

                               <div>
                                 <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-stone-600 dark:text-stone-400 font-sans">
                                   Store Logo Image URL *
                                 </label>
                                 <input
                                   type="text"
                                   value={adminLogoUrl}
                                   onChange={(e) => setAdminLogoUrl(cleanImageUrl(e.target.value))}
                                   className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                   required
                                 />
                               </div>

                               <div className="pt-2 flex items-center gap-2 font-sans">
                                 <button
                                   type="submit"
                                   className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md active:scale-[0.98] transition cursor-pointer font-sans"
                                 >
                                   Activate / Update Workstation
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => setAdminConfiguringTailorId(null)}
                                   className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl active:scale-[0.98] transition cursor-pointer font-sans"
                                 >
                                   Back
                                 </button>
                               </div>
                             </form>
                           </>
                         );
                       })()}
                     </div>
                   ) : (
                     /* Create Account for Shop Owner Form */
                     <div>
                       <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4 flex items-center gap-2 font-sans">
                         <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg"><Plus className="h-4 w-4" /></span>
                         <span>Register Shop Owner &amp; Create Account</span>
                       </h3>
                       <form onSubmit={(e) => {
                         e.preventDefault();
                         const target = e.currentTarget;
                         const name = (target.elements.namedItem('tailorName') as HTMLInputElement).value.trim();
                         const email = (target.elements.namedItem('tailorEmail') as HTMLInputElement).value.trim();
                         const password = (target.elements.namedItem('tailorPhone') as HTMLInputElement).value.trim();
                         const room = 'Studio Workspace';
                         const phone = (target.elements.namedItem('tailorPhone') as HTMLInputElement).value.trim();

                         if (!name || !email || !phone) {
                           triggerToast('Name, Email and Phone Number are required fields!', 'error');
                           return;
                         }
                         const list = getRegisteredTailors();
                         const emailConflict = list.some((x) => (x.email || '').toLowerCase().trim() === email.toLowerCase().trim());
                         const phoneConflict = list.some((x) => x.phone && x.phone.trim() === phone);
                         if (emailConflict || phoneConflict) {
                           triggerToast(emailConflict ? 'This email is already registered!' : 'This phone number is already registered!', 'error');
                           return;
                         }
                         const updated = [...list, { id: \`TLR-\${Date.now()}\`, name, email, password, phone, location: room, hasRegisteredShop: false }];
                         saveRegisteredTailors(updated);
                         setRegisteredTailors(updated);
                         triggerToast(\`Successfully registered \${name}! The password is set to their Phone Number.\`, 'success');
                         target.reset();
                       }} className="space-y-4 text-left font-sans">
                         <div>
                           <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-sans mb-3 flex items-start gap-2">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">💡</span>
                              <div>
                                <strong className="text-amber-700 dark:text-amber-400">Registration Policy:</strong> Only name, email address and phone number are required. The phone number serves as their login password, and they can sign in using either their email or phone number as username.
                              </div>
                           </div>
                           <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">Tailor / Owner Name</label>
                           <input name="tailorName" type="text" placeholder="e.g. Arthur S. Row" className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white" required />
                         </div>
                         <div>
                           <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">Login Email Address</label>
                           <input name="tailorEmail" type="email" placeholder="e.g. key@atelier.com" className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white" required />
                         </div>
                         <div>
                           <label className="hidden">Login Password</label>
                           <input name="tailorPswd" type="hidden" value="tailor123" />
                         </div>
                         <div>
                           <label className="hidden">Room Identifier / Address</label>
                           <input name="tailorLoc" type="hidden" value="Savile Row, London" />
                         </div>
                         <div>
                           <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">Tailor Phone Number</label>
                           <input name="tailorPhone" type="text" placeholder="+44 20 ..." className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white" required />
                         </div>
                         <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md active:scale-[0.98] transition-all font-sans">Register Shop Owner Account</button>
                       </form>
                     </div>
                   )}
                 </div>
               </div>
             </div>\n`;

const replacementString = content.replace(originalPart, newPart);
fs.writeFileSync(filePath, replacementString, 'utf8');
console.log("Successfully replaced!");
fs.unlinkSync(__filename); // Self deleted!
