import React, { useState, useEffect } from 'react';
import { ChefHat, Mail, Lock, Building2, CheckCircle, ShieldCheck, ArrowLeft, Loader2, Send } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (email: string, password: string, companyName: string) => Promise<boolean>;
  onVerify: (code: string) => void;
  onResendCode: () => void;
  errorMessage?: string;
  isVerifying?: boolean; // New prop to control view state
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister, onVerify, onResendCode, errorMessage, isVerifying = false }) => {
  // Credentials State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Verification State
  const [verificationCode, setVerificationCode] = useState('');
  const [isSimulatingSend, setIsSimulatingSend] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  
  // UI State
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulate sending email effect when entering Verify mode
  useEffect(() => {
    if (isVerifying) {
        setIsSimulatingSend(true);
        const timer = setTimeout(() => {
            setIsSimulatingSend(false);
            setCodeSent(true);
        }, 2000); // 2 second delay to simulate network
        return () => clearTimeout(timer);
    }
  }, [isVerifying]);

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    if (!email || !password) {
      setLocalError('Ju lutem plotësoni të gjitha fushat.');
      setIsLoading(false);
      return;
    }

    if (!isLogin && !companyName) {
      setLocalError('Ju lutem shkruani emrin e biznesit.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setLocalError('Fjalëkalimi duhet të ketë të paktën 6 karaktere.');
      setIsLoading(false);
      return;
    }

    let success = false;
    if (isLogin) {
      success = await onLogin(email, password);
    } else {
      success = await onRegister(email, password, companyName);
    }

    if (!success) {
        setIsLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (verificationCode.length < 4) {
          setLocalError("Ju lutem shkruani kodin e plotë.");
          return;
      }
      onVerify(verificationCode);
  };

  const handleResendClick = () => {
      setCodeSent(false);
      setIsSimulatingSend(true);
      setTimeout(() => {
          setIsSimulatingSend(false);
          setCodeSent(true);
      }, 1500);
      onResendCode();
  };

  // Combine local validation errors with server/logic errors passed from props
  const displayError = localError || errorMessage;

  // --- 2FA Verification View ---
  if (isVerifying) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
                <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
                <ShieldCheck className="w-10 h-10 text-white" />
                </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Verifikimi i Sigurisë
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
                Kemi dërguar një kod verifikimi në emailin tuaj.
            </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
                
                {isSimulatingSend ? (
                    <div className="text-center py-10">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Duke dërguar kodin në email...</p>
                        <p className="text-xs text-gray-400 mt-2">Ju lutem prisni pak sekonda.</p>
                    </div>
                ) : (
                    <form onSubmit={handleVerifySubmit} className="space-y-6 animate-fadeIn">
                    
                    {codeSent && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 mb-4 border border-green-100">
                            <Send className="w-4 h-4" />
                            <span>Kodi u dërgua me sukses!</span>
                        </div>
                    )}
                    
                    {/* DEMO HINT */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center mb-6">
                        <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-1">Demo Mode</p>
                        <p className="text-sm text-yellow-700">
                            Serveri i emailit është i çaktivizuar.<br/>
                            Përdorni kodin: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-yellow-300 ml-1 select-all">123456</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center mb-4">
                            Shkruani kodin 6-shifror
                        </label>
                        <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => {
                            setVerificationCode(e.target.value.replace(/[^0-9]/g, ''));
                            setLocalError('');
                        }}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-3xl tracking-[0.5em] font-mono text-gray-800"
                        placeholder="000000"
                        autoFocus
                        />
                    </div>

                    {displayError && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100 text-center animate-fadeIn">
                        {displayError}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Verifiko
                    </button>
                    
                    <div className="mt-6 text-center">
                        <button 
                            type="button"
                            onClick={handleResendClick}
                            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium underline"
                        >
                            Nuk e mora kodin? Ridërgo
                        </button>
                    </div>
                    </form>
                )}
            </div>
            </div>
        </div>
      );
  }

  // --- Login / Register View ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
               <ChefHat className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Hyr në llogarinë tënde' : 'Regjistro Biznesin'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Menaxho menutë nga cloud.' : 'Krijo menutë dixhitale në pak minuta.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
          
            <form className="space-y-6" onSubmit={handleSubmitCredentials}>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Emri i Biznesit
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      value={companyName}
                      onChange={(e) => {
                          setCompanyName(e.target.value);
                          setLocalError('');
                      }}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="psh. Bar Restorant..."
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Adresa
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setLocalError('');
                    }}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="emri@biznesi.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fjalëkalimi
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setLocalError('');
                    }}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {displayError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100 flex flex-col items-start gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                     <span className="font-medium">Gabim:</span> {displayError}
                  </div>
                  {/* Suggest Registration if Credential Error */}
                  {displayError.includes('i pasaktë') && isLogin && (
                      <button 
                        type="button"
                        onClick={() => {
                            setIsLogin(false);
                            setLocalError('');
                        }}
                        className="text-indigo-700 font-bold underline hover:text-indigo-900 mt-1"
                      >
                          Nuk keni llogari? Regjistrohuni këtu.
                      </button>
                  )}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLogin ? 'Vazhdo' : 'Regjistrohu'}
                </button>
              </div>
            </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                   Opsione
                </span>
              </div>
            </div>

            <div className="mt-6">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setLocalError('');
                  }}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {isLogin ? 'Krijo llogari të re' : 'Kthehu tek Hyrja'}
                </button>
            </div>
          </div>
        </div>
        
             <div className="mt-8 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Të dhëna të ruajtura në Server</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Autentifikim i sigurt</span>
                </div>
            </div>
      </div>
    </div>
  );
};

export default AuthPage;
