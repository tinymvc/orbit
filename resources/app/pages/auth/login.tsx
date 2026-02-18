import { useState } from "react";
import { useForm } from "@inertiajs/react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useApp } from "@/contexts/app";

export default function Login() {
  const { app } = useApp();
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    user: "",
    password: "",
    remember_me: true,
  });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    post("/admin/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center mb-2">
          <CardTitle className="text-2xl font-bold">{app.name}</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
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

            <div className="space-y-2">
              <Label htmlFor="password" className="block mb-2">
                Password <sup className="text-destructive">*</sup>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  disabled={processing}
                  className={
                    errors.password ? "border-destructive pr-10" : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={processing}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember_me"
                name="remember_me"
                checked={data.remember_me}
                onCheckedChange={(checked) =>
                  setData("remember_me", checked as boolean)
                }
                disabled={processing}
              />
              <label
                htmlFor="remember_me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-8">
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
