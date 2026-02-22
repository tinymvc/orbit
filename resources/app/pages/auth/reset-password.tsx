import { Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/app";

export default function Login({ token }: { token: string }) {
  const { app } = useApp();

  const { data, setData, post, processing, errors } = useForm({
    password: "",
    password_confirmation: "",
    token: token,
  });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    post("/admin/reset-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center mb-2">
          <CardTitle className="text-2xl font-bold">{app.name}</CardTitle>
          <CardDescription>Reset your password</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="block mb-2">
                New Password <sup className="text-destructive">*</sup>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your new password"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                disabled={processing}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="block mb-2">
                Confirm New Password <sup className="text-destructive">*</sup>
              </Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                placeholder="Confirm your new password"
                value={data.password_confirmation}
                onChange={(e) =>
                  setData("password_confirmation", e.target.value)
                }
                disabled={processing}
                className={
                  errors.password_confirmation ? "border-destructive" : ""
                }
              />
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-8">
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
            <div className="mt-2">
              <Link
                href="/admin/login"
                className="text-[0.8rem] text-primary flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="inline-block size-5" />
                Back to Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
