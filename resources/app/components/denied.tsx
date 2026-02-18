import { ShieldBan } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@inertiajs/react";

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
          administrator or return to the <Link href="/admin">Dashboard</Link>.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyDescription>
        Need help? <Link href="/support">Contact support</Link>
      </EmptyDescription>
    </Empty>
  );
}
