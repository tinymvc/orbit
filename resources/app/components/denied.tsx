import { ShieldBan } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { route } from "@/lib/utils";
import { Link } from "react-router";

export default function PermissionDenied() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldBan />
        </EmptyMedia>
        <EmptyTitle>Permission Denied</EmptyTitle>
        <EmptyDescription>
          You do not have permission to access this page. Please contact your
          administrator or return to the <Link to={route("/")}>home</Link>.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyDescription>
        Need help? <Link to={route("support")}>Contact support</Link>
      </EmptyDescription>
    </Empty>
  );
}
