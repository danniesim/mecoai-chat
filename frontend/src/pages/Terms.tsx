// Fancy terms of use page with standard terms using fluent ui components
import {
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Dialog,
  tokens,
} from "@fluentui/react-components";
import { Link } from "react-router-dom";

const Terms = () => {
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
        <DialogTitle style={{ fontSize: "2em" }}>Terms of Use</DialogTitle>
        <DialogContent
          style={{
            maxHeight: "67vh",
            background: tokens.colorNeutralBackground3,
          }}
        >
          <p>
            By accessing the website at mecorocketscientist.com, you are
            agreeing to be bound by these terms of service, all applicable laws
            and regulations, and agree that you are responsible for compliance
            with any applicable local laws. If you do not agree with any of
            these terms, you are prohibited from using or accessing this site.
            The materials contained in this website are protected by applicable
            copyright and trade mark law.
          </p>
          <h2>Use License</h2>
          <ol type="a">
            <li>
              Permission is granted to temporarily download one copy of the
              materials (information or software) on MecoAI's website for
              personal, non-commercial transitory viewing only. This is the
              grant of a license, not a transfer of title, and under this
              license you may not:
              <ol type="i">
                <li>modify or copy the materials;</li>
                <li>
                  use the materials for any commercial purpose, or for any
                  public display (commercial or non-commercial);
                </li>
                <li>
                  attempt to decompile or reverse engineer any software
                  contained on MecoAI's website;
                </li>
                <li>
                  remove any copyright or other proprietary notations from the
                  materials; or
                </li>
                <li>
                  transfer the materials to another person or "mirror" the
                  materials on any other server.
                </li>
              </ol>
            </li>
            <li>
              This license shall automatically terminate if you violate any of
              these restrictions and may be terminated by MecoAI at any time.
              Upon terminating your viewing of these materials or upon the
              termination of this license, you must destroy any downloaded
              materials in your possession whether in electronic or printed
              format.
            </li>
          </ol>
          <h2>Disclaimer</h2>
          <ol type="a">
            <li>
              The materials on MecoAI's website are provided on an 'as is'
              basis. MecoAI makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </li>
            <li>
              Further, Meco AI does not warrant or make any representations
              concerning the accuracy, likely results, or reliability of the use
              of the materials on its website or otherwise relating to such
              materials or on any sites linked to this site.
            </li>
          </ol>
          <h2>Limitations</h2>
          <p>
            In no event shall MecoAI or its suppliers be liable for any damages
            (including, without limitation, damages for loss of data or profit,
            or due to business interruption) arising out of the use or inability
            to use the materials on MecoAI's website, even if MecoAI or a MecoAI
            authorized representative has been notified orally or in writing of
            the possibility of such damage. Because some jurisdictions do not
            allow limitations on implied warranties, or limitations of liability
            for consequential or incidental damages, these limitations may not
            apply to you.
          </p>
          <h2>Accuracy of materials</h2>
          <p>
            The materials appearing on MecoAI's website could include technical,
            typographical, or photographic errors. MecoAI does not warrant that
            any of the materials on its website are accurate, complete or
            current. MecoAI may make changes to the materials contained on its
            website at any time without notice. However MecoAI does not make any
            commitment to update the materials.
          </p>
          <h2>Links</h2>
          <p>
            MecoAI has not reviewed all of the sites linked to its website and
            is not responsible for the contents of any such linked site. The
            inclusion of any link does not imply endorsement by MecoAI of the
            site. Use of any such linked website is at the user's own risk.
          </p>
          <h2>Modifications</h2>
          <p>
            MecoAI may revise these terms of service for its website at any time
            without notice. By using this website you are agreeing to be bound
            by the then current version of these terms of service.
          </p>
          <h2>Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in
            accordance with the laws of California and you irrevocably submit to
            the exclusive jurisdiction of the courts in that State or location.
          </p>
        </DialogContent>
        <DialogActions style={{ display: "flex", justifyContent: "center" }}>
          <Link to="/">
            <Button>Back to chat</Button>
          </Link>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

export default Terms;
