import { useContext, useEffect } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FluentProvider, teamsDarkTheme } from "@fluentui/react-components";
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { telemetryService } from "./components/TelemetryService";

import Layout from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Chat from "./pages/chat/Chat";

import { AppStateContext } from "./state/AppProvider";

export default function App() {
  const appStateContext = useContext(AppStateContext);

  useEffect(() => {
    const instrumentationKey = appStateContext?.state.frontendSettings?.applicationinsights_connection_string;
    if (instrumentationKey) {
      // console.log("Initializing Telemetry Service with key: ", instrumentationKey);
      telemetryService.initialize(instrumentationKey);
    }
  }, [appStateContext]);

  return (
    <AppInsightsContext.Provider value={telemetryService.reactPlugin}>
      <FluentProvider theme={teamsDarkTheme}>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Chat />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NoPage />} />
              </Route>
            </Routes>
          </Router>
      </FluentProvider>
    </AppInsightsContext.Provider>
  );
}