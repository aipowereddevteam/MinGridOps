"use client";

import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  onSuccessRedirect?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccessRedirect = "/today",
}) => {
  const router = useRouter();
  const { loginWithGoogle, error } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "1000000000000-dummygoogleclientid.apps.googleusercontent.com";

  const handleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setLocalError("Google ID Token missing");
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await loginWithGoogle(credentialResponse.credential);
      router.push(onSuccessRedirect);
    } catch (err: any) {
      setLocalError(err.message || "Google Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = () => {
    setLocalError("Google Sign-In prompt failed or was closed.");
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="w-full flex flex-col items-center gap-3">
        {localError && (
          <div className="w-full rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300 text-center">
            {localError}
          </div>
        )}

        <div className="w-full flex justify-center py-1">
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-2.5 text-xs font-semibold text-slate-200 border border-white/10 w-full">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Authenticating with Google...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_black"
              size="large"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};
