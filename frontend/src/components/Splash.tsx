import * as React from "react";

import {
  makeStyles,
  Image,
  Display,
  Subtitle2,
  Button,
} from "@fluentui/react-components";
import { AppStateContext } from "../state/AppProvider";
import MecoAI from "../assets/mecoai.svg";
import { Link } from "react-router-dom";

const useStyles = makeStyles({
  splash: {
    width: "480px",
    textAlign: "center",
    flexDirection: "column",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  centerpiece: { width: "96px" },
});

interface SplashProps {
  headlineText?: string | null;
  subText?: string | null;
}

export const Splash = ({
  headlineText = null,
  subText = null,
}: SplashProps) => {
  const appStateContext = React.useContext(AppStateContext);
  const ui = appStateContext?.state.frontendSettings?.ui;
  const classes = useStyles();
  return (
    <div className={classes.splash}>
      <Image
        className={classes.centerpiece}
        src={ui?.chat_logo ? ui.chat_logo : MecoAI}
      ></Image>
      {headlineText && <Display>{headlineText}</Display>}
      {subText && <Subtitle2>{subText}</Subtitle2>}
      {/* Flexbox row orientation items centered and evenly spaced */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* buttons that Link to Terms of use and Privacy Policy */}
        <Link to="/terms">
          <Button>Terms of Use</Button>
        </Link>
        <Link to="/privacy">
          <Button>Privacy Policy</Button>
        </Link>
      </div>
    </div>
  );
};
