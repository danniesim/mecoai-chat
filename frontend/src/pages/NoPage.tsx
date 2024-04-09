// Fancy 404 page using fluent ui components
import { DialogSurface, DialogTitle, DialogContent, Button } from "@fluentui/react-components";
import { Link } from "react-router-dom";

const NoPage = () => {
  return (
    <DialogSurface>
      <DialogTitle>404</DialogTitle>
      <DialogContent>
        <p>Page not found</p>
        <Link to="/">
          <Button>Go to chat</Button>
        </Link>
      </DialogContent>
    </DialogSurface>
  );
};
export default NoPage;
