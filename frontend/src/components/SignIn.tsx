import { useContext, useEffect } from "react";
import { AppStateContext } from "../state/AppProvider";
import { CredentialResponse } from "google-one-tap";

declare global {
  interface Window {
    google: typeof import("google-one-tap");
  }
}

export const SignIn = () => {
  const appStateContext = useContext(AppStateContext);
  const auth_client_id =
    appStateContext?.state.frontendSettings?.auth_client_id || null;
  const auth_login_uri =
    appStateContext?.state.frontendSettings?.auth_login_uri || null;

  useEffect(() => {
    if (!auth_client_id) {
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    // script.onload = () => {
    //   console.log("Google One Tap loaded");
    // };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [auth_client_id]);

  return (
    <div>
      <div>
        <div
          id="g_id_onload"
          data-client_id={auth_client_id}
          data-context="signin"
          data-ux_mode="popup"
          data-login_uri={auth_login_uri}
          data-auto_select="true"
          data-itp_support="true"
        ></div>
        <div
          className="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
        ></div>
      </div>
    </div>
  );
};
