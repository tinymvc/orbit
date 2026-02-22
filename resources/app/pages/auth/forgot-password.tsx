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

export default function Login() {
  const { app } = useApp();

  const { data, setData, post, processing, errors } = useForm({ user: "" });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    post("/admin/forgot-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center mb-2">
          <CardTitle className="text-2xl font-bold">{app.name}</CardTitle>
          <CardDescription>Request a password reset link</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user" className="block mb-2">
                Username or Email <sup className="text-destructive">*</sup>
              </Label>
              <Input
                id="user"
                name="user"
                type="text"
                placeholder="Enter your username or email"
                value={data.user}
                onChange={(e) => setData("user", e.target.value)}
                disabled={processing}
                className={errors.user ? "border-destructive" : ""}
              />
              {errors.user && (
                <p className="text-sm text-destructive">{errors.user}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-8">
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send Reset Link"
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
