import {ApplicationInsights, ITelemetryItem} from '@microsoft/applicationinsights-web';
import {ReactPlugin} from '@microsoft/applicationinsights-react-js';

let reactPlugin: ReactPlugin;
let appInsights: ApplicationInsights;

/**
 * Create the App Insights Telemetry Service
 * @return {{reactPlugin: ReactPlugin, appInsights: Object, initialize: Function}} - Object
 */
const createTelemetryService = (): { reactPlugin: ReactPlugin; appInsights: object; initialize: Function; } => {
  const initialize = (instrumentationKey: string) => {
    if (!instrumentationKey) {
      // Raise exception
      throw new Error("Instrumentation key not provided");
    }
    reactPlugin = new ReactPlugin();
    appInsights = new ApplicationInsights({
      config: {
        connectionString: instrumentationKey,
        extensions: [reactPlugin],
        enableAutoRouteTracking: true,
        disableAjaxTracking: false,
        autoTrackPageVisitTime: true,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
      }
    });
    appInsights.loadAppInsights();

    appInsights.addTelemetryInitializer((env:ITelemetryItem) => {
        env.tags = env.tags || [];
        env.tags["ai.cloud.role"] = "testTag";
    });
  };

  return { reactPlugin, appInsights, initialize };
};

export const telemetryService = createTelemetryService();
export const getAppInsights = () => appInsights;



