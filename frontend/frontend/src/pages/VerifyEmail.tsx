import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import PublicHeader from '@/components/medic/PublicHeader';
import Footer from '@/components/medic/Footer';
import { authApi } from '@/lib/api';

type Status = 'loading' | 'success' | 'error';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(res => setStatus(res.verified ? 'success' : 'error'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col">
      <PublicHeader />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
          {status === 'loading' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900">Vérification en cours…</h1>
              <p className="text-gray-500 text-sm mt-2">Un instant, on confirme votre adresse email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900">Email confirmé !</h1>
              <p className="text-gray-500 text-sm mt-2 mb-7">Votre compte MedConnect ODC est maintenant actif. Vous pouvez vous connecter.</p>
              <Link to="/login" className="inline-block w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors">
                Se connecter
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900">Lien invalide ou expiré</h1>
              <p className="text-gray-500 text-sm mt-2 mb-7">Demandez un nouvel email de confirmation depuis la page de connexion.</p>
              <Link to="/login" className="inline-block w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors">
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyEmail;
