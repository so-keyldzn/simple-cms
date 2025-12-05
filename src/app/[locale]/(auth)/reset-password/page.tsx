import { Suspense } from "react";
import ResetPassword from "@/features/auth/components/reset-password";
import { Loader2 } from "lucide-react";

function ResetPasswordLoading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPassword />
    </Suspense>
  );
}
