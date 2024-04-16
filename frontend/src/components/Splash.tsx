import * as React from "react";

import {
  makeStyles,
  shorthands,
  Image,
  LargeTitle,
  Subtitle2,
  Button,
} from "@fluentui/react-components";
import { AppStateContext } from "../state/AppProvider";
import MecoAI from "../assets/mecoai.svg";
import { Link } from "react-router-dom";

const useStyles = makeStyles({
  splash: {
    maxWidth: "480px",
    width: "90%",
    textAlign: "center",
    flexDirection: "column",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    ...shorthands.gap("16px"),
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
      {headlineText && <LargeTitle>{headlineText}</LargeTitle>}
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
