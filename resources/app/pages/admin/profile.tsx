import { useState } from "react";
import { useForm } from "@inertiajs/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Lock, AlertCircle, EyeOff, Eye } from "lucide-react";
import { useApp } from "@/contexts/app";

export default function ProfilePage() {
  const { user } = useApp();
  const [showPassword, setShowPassword] = useState(false);

  // ─── General info form ──────────────────────────────────────────────
  const generalForm = useForm({
    action: "general" as const,
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    email: user?.email || "",
  });

  const handleGeneralSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    generalForm.post("/admin/profile", { preserveScroll: true });
  };

  // ─── Password form ──────────────────────────────────────────────────
  const passwordForm = useForm({
    action: "password" as const,
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handlePasswordSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    passwordForm.post("/admin/profile", {
      preserveScroll: true,
      onSuccess: () => {
        passwordForm.reset(
          "current_password",
          "password",
          "password_confirmation",
        );
      },
    });
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <Tabs defaultValue="general" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="general" className="gap-2">
                <User className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="password" className="gap-2">
                <Lock className="h-4 w-4" />
                Password
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {/* ─── General Tab ─────────────────────────────────────── */}
            <TabsContent value="general" className="space-y-4 mt-0">
              <div>
                <CardTitle className="text-lg">General Information</CardTitle>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </div>

              <form onSubmit={handleGeneralSubmit} className="space-y-4">
                {(generalForm.errors as Record<string, string>).general && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {(generalForm.errors as Record<string, string>).general}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="block mb-2">
                      First Name{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="first_name"
                      value={generalForm.data.first_name}
                      onChange={(e) =>
                        generalForm.setData("first_name", e.target.value)
                      }
                      placeholder="Enter your first name"
                      maxLength={100}
                      disabled={generalForm.processing}
                      className={
                        generalForm.errors.first_name
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {generalForm.errors.first_name && (
                      <p className="text-sm text-destructive">
                        {generalForm.errors.first_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="block mb-2">
                      Last Name{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="last_name"
                      value={generalForm.data.last_name}
                      onChange={(e) =>
                        generalForm.setData("last_name", e.target.value)
                      }
                      placeholder="Enter your last name"
                      maxLength={100}
                      disabled={generalForm.processing}
                      className={
                        generalForm.errors.last_name ? "border-destructive" : ""
                      }
                    />
                    {generalForm.errors.last_name && (
                      <p className="text-sm text-destructive">
                        {generalForm.errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="block mb-2">
                    Username <sup className="text-destructive">*</sup>
                  </Label>
                  <Input
                    id="username"
                    value={generalForm.data.username}
                    onChange={(e) =>
                      generalForm.setData("username", e.target.value)
                    }
                    placeholder="Enter your username"
                    required
                    maxLength={50}
                    disabled={generalForm.processing}
                    className={
                      generalForm.errors.username ? "border-destructive" : ""
                    }
                  />
                  {generalForm.errors.username && (
                    <p className="text-sm text-destructive">
                      {generalForm.errors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="block mb-2">
                    Email <sup className="text-destructive">*</sup>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={generalForm.data.email}
                    onChange={(e) =>
                      generalForm.setData("email", e.target.value)
                    }
                    placeholder="Enter your email"
                    required
                    maxLength={100}
                    disabled={generalForm.processing}
                    className={
                      generalForm.errors.email ? "border-destructive" : ""
                    }
                  />
                  {generalForm.errors.email && (
                    <p className="text-sm text-destructive">
                      {generalForm.errors.email}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={generalForm.processing}
                  className="w-full md:w-auto"
                >
                  {generalForm.processing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </TabsContent>

            {/* ─── Password Tab ─────────────────────────────────────── */}
            <TabsContent value="password" className="space-y-4 mt-0">
              <div>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {(passwordForm.errors as Record<string, string>).general && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {(passwordForm.errors as Record<string, string>).general}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current_password" className="block mb-2">
                    Current Password <sup className="text-destructive">*</sup>
                  </Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.data.current_password}
                      onChange={(e) =>
                        passwordForm.setData("current_password", e.target.value)
                      }
                      placeholder="Enter current password"
                      required
                      minLength={8}
                      maxLength={100}
                      disabled={passwordForm.processing}
                      className={
                        passwordForm.errors.current_password
                          ? "border-destructive"
                          : ""
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={passwordForm.processing}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.errors.current_password && (
                    <p className="text-sm text-destructive">
                      {passwordForm.errors.current_password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="block mb-2">
                    New Password <sup className="text-destructive">*</sup>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={passwordForm.data.password}
                      onChange={(e) =>
                        passwordForm.setData("password", e.target.value)
                      }
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      maxLength={100}
                      disabled={passwordForm.processing}
                      className={
                        passwordForm.errors.password ? "border-destructive" : ""
                      }
                    />
                  </div>
                  {passwordForm.errors.password ? (
                    <p className="text-sm text-destructive">
                      {passwordForm.errors.password}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className="block mb-2">
                    Confirm New Password{" "}
                    <sup className="text-destructive">*</sup>
                  </Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={passwordForm.data.password_confirmation}
                    onChange={(e) =>
                      passwordForm.setData(
                        "password_confirmation",
                        e.target.value,
                      )
                    }
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    maxLength={100}
                    disabled={passwordForm.processing}
                    className={
                      passwordForm.errors.password_confirmation
                        ? "border-destructive"
                        : ""
                    }
                  />
                  {passwordForm.errors.password_confirmation && (
                    <p className="text-sm text-destructive">
                      {passwordForm.errors.password_confirmation}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={passwordForm.processing}
                  className="w-full md:w-auto"
                >
                  {passwordForm.processing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
