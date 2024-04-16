import { Outlet, Link, useNavigate } from "react-router-dom";
import styles from "./Layout.module.css";
import MecoAI from "../../assets/mecoai.svg";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  Input,
  Button,
} from "@fluentui/react-components";
import { useContext, useEffect, useState } from "react";
import {
  HistoryButton,
  ShareButton,
  SignOutButton,
} from "../../components/common/Button";
import { AppStateContext } from "../../state/AppProvider";
import { CosmosDBStatus, getUserInfo } from "../../api";

const Layout = () => {
  const navigate = useNavigate();
  const [copyClicked, setCopyClicked] = useState<boolean>(false);
  const [copyText, setCopyText] = useState<string>("Copy URL");
  const [shareLabel, setShareLabel] = useState<string | undefined>("Share");
  const [hideHistoryLabel, setHideHistoryLabel] =
    useState<string>("Hide chat history");
  const [showHistoryLabel, setShowHistoryLabel] =
    useState<string>("Show chat history");
  const appStateContext = useContext(AppStateContext);
  const ui = appStateContext?.state.frontendSettings?.ui;
  const AUTH_ENABLED =
    appStateContext?.state.frontendSettings?.auth_enabled || null;
  const userId = appStateContext?.state.userId || null;

  const getUserInfoList = async () => {
    if (!AUTH_ENABLED) {
      appStateContext?.dispatch({ type: "SET_USER_ID", payload: "test" });
      return;
    }
    const userInfoList = await getUserInfo();
    appStateContext?.dispatch({ type: "SET_USER_LOADED", payload: true });
    if (userInfoList.length === 0) {
      appStateContext?.dispatch({ type: "SET_USER_ID", payload: null });
    } else {
      appStateContext?.dispatch({
        type: "SET_USER_ID",
        payload: userInfoList[0].user_id,
      });
    }
  };

  useEffect(() => {
    if (AUTH_ENABLED !== null) getUserInfoList();
  }, [AUTH_ENABLED]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyClicked(true);
  };

  const handleHistoryClick = () => {
    appStateContext?.dispatch({ type: "TOGGLE_CHAT_HISTORY" });
  };

  const handleSignOutClick = () => {
    fetch("/auth/logout", {
      method: "GET",
    })
      .then(() => {
        appStateContext?.dispatch({ type: "SET_USER_ID", payload: null });
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  useEffect(() => {
    if (copyClicked) {
      setCopyText("Copied URL");
    }
  }, [copyClicked]);

  useEffect(() => {}, [appStateContext?.state.isCosmosDBAvailable.status]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setShareLabel(undefined);
        setHideHistoryLabel("Hide history");
        setShowHistoryLabel("Show history");
      } else {
        setShareLabel("Share");
        setHideHistoryLabel("Hide chat history");
        setShowHistoryLabel("Show chat history");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ogImage =
    "https://chat.mecorocketscientist.com/public/mecoai-breaking-moon-landing.png";

  const ogDescription =
    "MecoAI draws upon the Mecoteca a corpus on the scientific study and engineering of rocket systems and spacecraft. It covers aspects of chemistry, math, thermodynamics, aerodynamics, material science, electronics, failure analysis, machining, metalworking, model building, composite techniques, experimental methods, natural forces, laws of motion, and technical problems related to the development and experimentation of rockets, including stories and lessons from spaceflight history.";

  const ogTitle = "MecoAI - Your Rocket Scientist Buddy";

  return (
    <>
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <header className={styles.header} role={"banner"}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              verticalAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                verticalAlign: "center",
                justifyContent: "start",
                margin: "4px",
              }}
            >
              <Link to="/" className={styles.headerTitleContainer}>
                <img
                  src={ui?.logo ? ui.logo : MecoAI}
                  className={styles.headerIcon}
                  aria-hidden="true"
                />
                <h1 className={styles.headerTitle}>{ui?.title}</h1>
              </Link>
            </div>
            <div
              style={{
                display: "flex",
                flexGrow: 1,
                flexDirection: "row",
                verticalAlign: "center",
                justifyContent: "end",
                margin: "4px",
                gap: "8px",
              }}
            >
              {appStateContext?.state.isCosmosDBAvailable?.status ==
                CosmosDBStatus.Working &&
                userId && (
                  <HistoryButton
                    onClick={handleHistoryClick}
                    text={
                      appStateContext?.state?.isChatHistoryOpen
                        ? hideHistoryLabel
                        : showHistoryLabel
                    }
                  />
                )}
              {ui?.show_share_button && (
                <Dialog>
                  <DialogTrigger>
                    <ShareButton onClick={() => {}} text={shareLabel} />
                  </DialogTrigger>
                  <DialogSurface
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <DialogTitle>Share</DialogTitle>
                    <DialogContent
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "8px",
                      }}
                    >
                      <Input
                        defaultValue={window.location.href}
                        readOnly
                        style={{ flexGrow: 2 }}
                      />
                      <Button onClick={handleCopyClick}>{copyText}</Button>
                    </DialogContent>
                  </DialogSurface>
                </Dialog>
              )}
              {userId != null && (
                <SignOutButton onClick={handleSignOutClick} text={"Sign out"} />
              )}
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
