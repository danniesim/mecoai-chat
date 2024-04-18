// Fancy privacy oage with standard privacy policy using fluent ui components
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  tokens,
} from "@fluentui/react-components";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <Dialog
      defaultOpen
      onOpenChange={(_, data) => {
        if (!data.open) {
          window.history.back();
        }
      }}
    >
      <DialogSurface
        style={{
          overflow: "auto",
          gap: "24px",
          display: "flex",
          flexFlow: "column",
        }}
      >
        <DialogTitle style={{ fontSize: "2em" }}>Privacy Policy</DialogTitle>
        <DialogContent
          style={{
            maxHeight: "67vh",
            background: tokens.colorNeutralBackground3,
          }}
        >
          <h2>Introduction</h2>
          <p>
            Your privacy is important to us. It is our policy to respect your
            privacy regarding any information we may collect from you across our
            website, mecorocketscientist.com, and other sites we own and
            operate.
          </p>
          <h2>Authentication</h2>
          <p>
            Sign in with google.com is used to authenticate you. Your name,
            email and profile picture shared is used to identify and personalize
            your experience. We may contact you via email in order to provide
            you with the requested service.
          </p>
          <h2>Data Collection</h2>
          <p>
            We only ask for personal information when we truly need it to
            provide a service to you. We collect it by fair and lawful means,
            with your knowledge and consent. We also let you know why we’re
            collecting it and how it will be used.
          </p>
          <h2>Data Retention</h2>
          <p>
            We only retain collected information for as long as necessary to
            provide you with your requested service. What data we store, we’ll
            protect within commercially acceptable means to prevent loss and
            theft, as well as unauthorised access, disclosure, copying, use or
            modification.
          </p>
          <h2>Information Sharing</h2>
          <p>
            We don’t share any personally identifying information publicly or
            with third-parties, except when required to by law.
          </p>
          <h2>External Links</h2>
          <p>
            Our website may link to external sites that are not operated by us.
            Please be aware that we have no control over the content and
            practices of these sites, and cannot accept responsibility or
            liability for their respective privacy policies.
          </p>
          <h2>Right to Refuse</h2>
          <p>
            You are free to refuse our request for your personal information,
            with the understanding that we may be unable to provide you with
            some of your desired services.
          </p>
          <h2>Acceptance of Policy</h2>
          <p>
            Your continued use of our website will be regarded as acceptance of
            our practices around privacy and personal information. If you have
            any questions about how we handle user data and personal
            information, feel free to contact us.
          </p>
          <h2>Policy Effective Date</h2>
          <p>This policy is effective as of 8 April 2024.</p>
          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          ></div>
        </DialogContent>
        <DialogActions style={{ display: "flex", justifyContent: "center" }}>
          <Link to="/">
            <Button>Go to chat</Button>
          </Link>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

export default Privacy;
