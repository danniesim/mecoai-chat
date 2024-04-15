import { useContext, useEffect } from "react";
import { AppStateContext } from "../state/AppProvider";

export const SignIn = () => {
  const appStateContext = useContext(AppStateContext);
  const auth_client_id =
    appStateContext?.state.frontendSettings?.auth_client_id || null;
  const user_id = appStateContext?.state.userId || null;

  useEffect(() => {
    if (!auth_client_id) {
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [auth_client_id]);

  return (
    <div>
      {auth_client_id && !user_id && (
        <div>
          <div
            id="g_id_onload"
            data-client_id={auth_client_id}
            data-context="signin"
            data-ux_mode="popup"
            data-login_uri="/auth/callback/google"
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
      )}
    </div>
  );
};
