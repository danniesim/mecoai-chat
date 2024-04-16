import { tokens } from "@fluentui/react-components";
import { Splash } from "../components/Splash";
import { SignIn } from "../components/SignIn";

export const Home = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          gap: "24px",
          background: tokens.colorNeutralBackground5,
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Splash
          headlineText={"Just Your Friendly Neighbourhood Rocket Scientist"}
          subText={
            "MecoAI is a simulated rocket scientist who answers your questions by referencing the Mecoteca" +
            " - a large set of research notes curated while developing the Meco Rocket Simulator."
          }
        />
        <SignIn />
      </div>
      <div
        style={{
          display: "flex",
          color: tokens.colorNeutralForeground4,
          backgroundColor: tokens.colorNeutralBackground1,
          fontSize: "smaller",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexFlow: "row wrap",
            maxWidth: "480px",
            gap: "16px",
            width: "90%",
          }}
        >
          <div style={{ flex: "1.5 0 0", minWidth: "0px" }}>
            <div style={{ textAlign: "left" }}>
              © {new Date().getFullYear()} Loren Aerospace Limited. All rights
              reserved.
            </div>
            <div
              style={{
                display: "flex",
                flexFlow: "row wrap",
                alignItems: "center",
                width: "100%",
              }}
            >
              <a
                href="https://discord.gg/ybCgvDcFAA"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://img.icons8.com/color/48/000000/discord-logo.png"
                  alt="Discord"
                />
              </a>
              <a
                href="https://x.com/rocketsimulator"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://img.icons8.com/color/48/000000/twitterx.png"
                  alt="Twitter"
                />
              </a>
              <a
                href="https://mecorocketsimulator.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://www.mecorocketsimulator.com/wp-content/uploads/2024/04/meco_banner_web_transparent.svg"
                  alt="Meco Rocket Simulator"
                  style={{ height: "40px" }}
                />
              </a>
            </div>
          </div>
          <div
            style={{
              textAlign: "left",
              flex: "1 0 0",
              minWidth: "150px",
            }}
          >
            MecoAI is a trading name of Loren Aerospace Limited, a company
            registered in England and Wales (No. 14563299) at 86-90 Paul Street,
            London, EC2A 4NE, UK.
          </div>
        </div>
      </div>
    </>
  );
};
