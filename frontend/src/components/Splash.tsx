import * as React from "react";

import {
  makeStyles,
  Image,
  Display,
  Subtitle2
} from "@fluentui/react-components";
import { AppStateContext } from "../state/AppProvider";
import MecoAI from "../assets/mecoai.svg";

const useStyles = makeStyles({
  splash: { width: "480px", textAlign: "center", flexDirection: "column", display: "flex", justifyContent: "center", alignItems: "center"},
  centerpiece: { width: "96px" },
});


export const Splash = () => {
  const appStateContext = React.useContext(AppStateContext)
  const ui = appStateContext?.state.frontendSettings?.ui;
  const classes = useStyles();
  return (
    <div className={classes.splash}> 
      <Image className={classes.centerpiece} src={ui?.chat_logo ? ui.chat_logo : MecoAI} ></Image>
      <Display>{ui?.chat_title}</Display>
      <Subtitle2 align="center">{ui?.chat_description}</Subtitle2>
    </div>
  );
};
