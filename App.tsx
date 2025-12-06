import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './services/firebase'; // Import Firebase services

import CompanyForm from './components/CompanyForm';
import MenuBuilder from './components/MenuBuilder';
import PublicView from './components/PublicView';
import QRCodeModal from './components/QRCodeModal';
import AuthPage from './components/AuthPage';
import { Company, Menu, User } from './types';
import { ChefHat, LayoutGrid, LogOut, Loader2, Database, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  // Added 'verify' to the view type definition
  const [view, setView] = useState<'admin' | 'public' | 'auth' | 'verify'>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [dbError, setDbError] = useState<string>(''); 
  const [loading, setLoading] = useState(true);

  // State for Admin Data
  const [company, setCompany] = useState<Company>({
      name: '',
      address: '',
      phone: '',
      currency: 'LEK',
      colorTheme: '#4f46e5'
  });

  const [menus, setMenus] = useState<Menu[]>([]);

  // State for Public/Shared Data (decoded from URL)
  const [sharedData, setSharedData] = useState<{menu: Menu, company: Company} | null>(null);

  const [qrModal, setQrModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  // --- Effects ---

  // 1. Handle Auth State & Data Sync
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setDbError(''); 

      if (user) {
        // User is signed in to Firebase
        
        // --- 2FA CHECK ---
        // Check if this browser session has been verified
        const isSessionVerified = sessionStorage.getItem(`2fa_verified_${user.uid}`);
        
        try {
            const userRef = doc(db, 'users', user.uid);
            
            // Attempt to fetch user data
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                setCurrentUser({
                    id: user.uid,
                    email: user.email || '',
                    companyName: userData.companyName
                });

                // Set Real-time listener for Company Data
                const companyRef = doc(db, 'companies', user.uid);
                onSnapshot(companyRef, (doc) => {
                    if (doc.exists()) {
                        setCompany(doc.data() as Company);
                    } else {
                        setCompany(prev => ({ ...prev, name: userData.companyName }));
                    }
                }, (error) => handleDbError(error));

                 // Set Real-time listener for Menus Data
                 const menuRef = doc(db, 'menus', user.uid);
                 onSnapshot(menuRef, (doc) => {
                     if (doc.exists()) {
                         setMenus(doc.data().items as Menu[]);
                     } else {
                         setMenus([]);
                     }
                 }, (error) => {
                    if (!dbError) handleDbError(error);
                 });
                 
                 // Decide View based on 2FA
                 if (isSessionVerified === 'true') {
                     setView('admin');
                 } else {
                     setView('verify');
                 }
            } else {
                // Fallback for missing user doc
                setCurrentUser({
                    id: user.uid,
                    email: user.email || '',
                    companyName: 'Biznesi Im'
                });
                
                if (isSessionVerified === 'true') {
                     setView('admin');
                 } else {
                     setView('verify');
                 }
            }
        } catch (err: any) {
            console.error("Login Data Fetch Error:", err);
            handleDbError(err);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setView('auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Save Data to Firestore (Debounced or on Change)
  const saveCompany = async (newCompany: Company) => {
      setCompany(newCompany);
      if (currentUser && db) {
          try {
            await setDoc(doc(db, 'companies', currentUser.id), newCompany);
          } catch (e: any) {
              console.error("Error saving company:", e);
              handleDbError(e);
          }
      }
  };

  const saveMenus = async (newMenus: Menu[]) => {
      setMenus(newMenus); 
      if (currentUser && db) {
          try {
              await setDoc(doc(db, 'menus', currentUser.id), { items: newMenus });
          } catch (e: any) {
              console.error("Error saving menus:", e);
              handleDbError(e);
          }
      }
  };
  
  const handleSetMenus = (action: React.SetStateAction<Menu[]>) => {
      const newMenus = typeof action === 'function' ? action(menus) : action;
      saveMenus(newMenus);
  };

  // 3. Routing Logic (Hash based)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash.startsWith('#/share')) {
        try {
            const params = new URLSearchParams(hash.split('?')[1]);
            const encodedData = params.get('d');
            
            if (encodedData) {
                const jsonString = decodeURIComponent(
                    Array.prototype.map.call(atob(encodedData), (c: string) => {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join('')
                );
                
                const data = JSON.parse(jsonString);
                
                const sharedCompany: Company = {
                    name: data.c.n || 'Menu',
                    address: data.c.a || '',
                    phone: data.c.p || '',
                    currency: data.c.cur || 'LEK',
                    colorTheme: '#4f46e5'
                };
                
                const sharedMenu: Menu = {
                    id: 'shared-view',
                    title: data.m.t || 'Menu',
                    isActive: true,
                    products: (data.m.p || []).map((p: any) => ({
                        id: crypto.randomUUID(),
                        name: p.n,
                        price: p.p,
                        description: p.d,
                        category: p.c
                    }))
                };

                setSharedData({ menu: sharedMenu, company: sharedCompany });
                setView('public');
                return;
            }
        } catch (e) {
            console.error("Failed to parse shared menu url", e);
        }
      } 
      
      setSharedData(null);
      // The auth effect will handle the main view state
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); 

  // --- Handlers ---
  
  const handleDbError = (err: any) => {
     if (!err) return;
     const msg = err.message || '';
     const code = err.code || '';

     if (code === 'not-found' || msg.includes("database (default) does not exist")) {
         setDbError("not-found");
     } else if (msg.includes("Cloud Firestore API")) {
         setDbError("api-disabled");
     } else if (msg.includes("offline") || code === 'unavailable') {
         setDbError("offline-db-check");
     } else if (code === 'permission-denied') {
         setDbError("permission-denied");
     } else {
        setDbError((prev) => prev && prev !== 'generic' ? prev : 'generic');
     }
  };
  
  const getFriendlyErrorMessage = (error: any) => {
    console.error("Firebase Error:", error);
    if (error.code === 'auth/invalid-credential') {
        return 'Email ose fjalëkalimi është i pasaktë.';
    } else if (error.code === 'auth/email-already-in-use') {
        return 'Kjo email adresë është e regjistruar tashmë.';
    } else if (error.code === 'auth/configuration-not-found') {
        return 'Konfigurimi u gjet por Authentication nuk është aktiv.';
    } else if (error.code === 'auth/operation-not-allowed') {
        return 'Hyrja me Email/Password nuk është aktivizuar në Firebase Console.';
    } else if (error.code === 'auth/network-request-failed') {
        return 'Problem me internetin. Ju lutem kontrolloni lidhjen.';
    }
    return 'Ndodhi një gabim: ' + (error.message || 'I panjohur');
  };

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    setAuthError('');
    try {
        if (!auth) throw new Error("Firebase not initialized");
        await signInWithEmailAndPassword(auth, email, pass);
        // Do not setView('admin') here. The useEffect listener handles it 
        // and checks for 2FA.
        return true;
    } catch (error: any) {
        setAuthError(getFriendlyErrorMessage(error));
        return false;
    }
  };

  const handleRegister = async (email: string, pass: string, companyName: string): Promise<boolean> => {
    setAuthError('');
    try {
        if (!auth) throw new Error("Firebase not initialized");
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Auto-verify 2FA for new registration (User is just created, so they are trusted)
        sessionStorage.setItem(`2fa_verified_${user.uid}`, 'true');

        try {
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                companyName: companyName,
                createdAt: new Date()
            });
            
            await setDoc(doc(db, 'companies', user.uid), {
                name: companyName,
                address: '',
                phone: '',
                currency: 'LEK',
                colorTheme: '#4f46e5'
            });
            await setDoc(doc(db, 'menus', user.uid), { items: [] });
        } catch (dbErr: any) {
            console.error("Database Creation Error:", dbErr);
            handleDbError(dbErr);
        }

        return true;
    } catch (error: any) {
        setAuthError(getFriendlyErrorMessage(error));
        return false;
    }
  };

  const handleVerify2FA = (code: string) => {
      // Mock Verification - In real app, check against server or generated OTP
      if (code === '123456') {
          if (currentUser) {
            sessionStorage.setItem(`2fa_verified_${currentUser.id}`, 'true');
            setView('admin');
            setAuthError('');
          }
      } else {
          setAuthError('Kodi i verifikimit është i pasaktë.');
      }
  };

  const handleLogout = async () => {
    // Clear ALL session storage to prevent 2FA bypass on re-login
    sessionStorage.clear();
    
    if(auth) await signOut(auth);
    setCompany({ name: '', address: '', phone: '', currency: 'LEK', colorTheme: ''});
    setMenus([]);
    setDbError('');
    setAuthError('');
  };

  const handleGenerateQR = (menuId: string) => {
    const menu = menus.find((m) => m.id === menuId);
    if (!menu) return;

    const payload = {
        c: { 
            n: company.name,
            a: company.address,
            p: company.phone,
            cur: company.currency
        },
        m: {
            t: menu.title,
            p: menu.products.map(prod => ({
                n: prod.name,
                p: prod.price,
                d: prod.description
            }))
        }
    };

    const jsonString = JSON.stringify(payload);
    const encodedData = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt("0x" + p1));
    }));

    const baseUrl = window.location.origin + window.location.pathname;
    const publicUrl = `${baseUrl}#/share?d=${encodedData}`;
    
    setQrModal({
      isOpen: true,
      url: publicUrl,
      title: menu.title,
    });
  };

  // --- Render ---

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-500">Duke u lidhur me serverin...</p>
              </div>
          </div>
      );
  }

  // 1. Critical Config Error
  if (!auth) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center border-l-4 border-red-500">
                  <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Konfigurimi i Munguar</h2>
                  <p className="text-gray-600 mb-6">
                      Ju lutem kontrolloni <code>services/firebase.ts</code>.
                  </p>
              </div>
          </div>
      );
  }
  
  // 2. Critical Runtime Error (DB Missing)
  if (dbError) {
      const renderErrorContent = () => {
          if (dbError === 'not-found' || dbError === 'offline-db-check') {
              return (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Databaza Nuk Ekziston</h2>
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 text-left text-sm">
                        <p className="font-semibold mb-2">Mesazhi i Sistemit:</p>
                        "The database (default) does not exist for project qr-menu-95ec0"
                    </div>
                    <div className="text-left space-y-4 text-gray-600">
                        <p>Krijoni databazën manualisht në Firebase Console (Test Mode).</p>
                        <a 
                            href="https://console.cloud.google.com/datastore/setup?project=qr-menu-95ec0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center mt-4 bg-indigo-100 text-indigo-700 py-3 rounded-lg font-bold hover:bg-indigo-200 transition-colors"
                        >
                            Hap Panelin e Krijimit të Databazës &rarr;
                        </a>
                    </div>
                  </>
              );
          }
          if (dbError === 'api-disabled') {
              return (
                  <>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Firestore API i Çaktivizuar</h2>
                     <a 
                        href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=qr-menu-95ec0"
                        target="_blank"
                         rel="noopener noreferrer"
                        className="text-indigo-600 underline font-medium"
                     >
                        Aktivizo Firestore API
                     </a>
                  </>
              )
          }
          return (
               <>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Gabim Lidhjeje</h2>
                 <p className="text-sm bg-gray-100 p-2 rounded text-red-500 font-mono overflow-auto">{dbError}</p>
               </>
          );
      };

      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full text-center border-l-4 border-yellow-500">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  {renderErrorContent()}
                  <button onClick={() => window.location.reload()} className="mt-8 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors">
                    Rifresko Faqen
                  </button>
              </div>
          </div>
      );
  }

  // 3. Public View
  if (view === 'public' && sharedData) {
    return <PublicView menu={sharedData.menu} company={sharedData.company} />;
  }

  // 4. Verification View (Logged in but 2FA required)
  if (view === 'verify' && currentUser) {
      return (
          <AuthPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            onVerify={handleVerify2FA}
            onResendCode={() => {}}
            errorMessage={authError}
            isVerifying={true}
          />
      );
  }

  // 5. Auth View (Not logged in)
  if (view === 'auth' && !currentUser) {
    return (
        <AuthPage 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            onVerify={handleVerify2FA}
            onResendCode={() => {}}
            errorMessage={authError}
            isVerifying={false}
        />
    );
  }

  // 6. Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
              MenuMaster AI
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 hidden sm:block">
                {currentUser?.email}
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
                <LogOut className="w-4 h-4" />
                Dil
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
                Mirësevini, {company.name || currentUser?.companyName}!
            </h1>
            <p className="text-gray-600 mt-2">Menaxhoni biznesin tuaj. Të dhënat ruhen automatikisht në Cloud.</p>
        </div>

        <CompanyForm initialData={company} onSave={saveCompany} />
        
        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-600" />
                Menaxhimi i Menuve
            </h2>
            <MenuBuilder 
                menus={menus} 
                setMenus={handleSetMenus} 
                company={company}
                onGenerateQR={handleGenerateQR}
            />
        </div>
      </main>

      {qrModal.isOpen && (
        <QRCodeModal 
          url={qrModal.url} 
          title={qrModal.title} 
          onClose={() => setQrModal({ ...qrModal, isOpen: false })} 
        />
      )}
    </div>
  );
};

export default App;