import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Kirish — EduLens" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Link to="/"><Logo /></Link></div>
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8" style={{ boxShadow: "var(--shadow-soft)" }}>
          <Tabs defaultValue="login">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="login">Kirish</TabsTrigger>
              <TabsTrigger value="register">Ro'yxatdan o'tish</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><LoginForm /></TabsContent>
            <TabsContent value="register"><RegisterForm /></TabsContent>
          </Tabs>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Bosh sahifaga qaytish</Link>
        </p>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Xush kelibsiz!");
    navigate({ to: "/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siz@misol.uz" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Parol</Label>
        <Input id="login-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Kirilmoqda..." : "Kirish"}</Button>
    </form>
  );
}

function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "counselor" | "parent">("student");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: fullName, role },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Hisob yaratildi!");
    navigate({ to: "/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-name">To'liq ism</Label>
        <Input id="reg-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ism Familiya" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-role">Sizning rolingiz</Label>
        <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
          <SelectTrigger id="reg-role"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="student">O'quvchi</SelectItem>
            <SelectItem value="counselor">Maslahatchi</SelectItem>
            <SelectItem value="parent">Ota-ona</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siz@misol.uz" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Parol</Label>
        <Input id="reg-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-xs text-muted-foreground">Kamida 6 ta belgi</p>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}</Button>
    </form>
  );
}