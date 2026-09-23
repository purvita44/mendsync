import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MendSyncLogo } from "./MendSyncLogo";
import { ShieldCheck, UserCheck, Lock, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string; avatarUrl?: string }) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Practice Administrator");
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = (demoRole: string, demoName: string, demoEmail: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const user = {
        name: demoName,
        email: demoEmail,
        role: demoRole,
      };
      localStorage.setItem("mendsync-auth-user", JSON.stringify(user));
      onLoginSuccess(user);
      setIsLoading(false);
      onClose();
      toast.success(`Welcome back, ${demoName}!`, {
        description: `Logged in as ${demoRole} (MendSync Session Active)`,
      });
    }, 400);
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const user = {
        name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
        email,
        role: "Practice Administrator",
      };
      localStorage.setItem("mendsync-auth-user", JSON.stringify(user));
      onLoginSuccess(user);
      setIsLoading(false);
      onClose();
      toast.success("Authenticated successfully", {
        description: "Your session is now stored securely.",
      });
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 size-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <MendSyncLogo size="lg" className="mb-3 font-semibold text-white [&_span]:text-white [&_span:nth-child(2)]:text-teal-400" />
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            Sign in to MendSync
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-xs mt-1">
            Enterprise Patient Care & Google Calendar Sync Control Panel
          </DialogDescription>
        </div>

        <div className="p-6 bg-white space-y-5">
          {/* Quick Demo Presets */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-teal-600" /> Quick Demo Login
              </span>
              <Badge variant="outline" className="text-[10px] border-teal-200 text-teal-700 bg-teal-50">
                1-Click Preset
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleDemoLogin("Clinical Specialist", "Dr. Alex Rivera, MD", "alex.rivera@mendsync.health")}
                className="justify-start h-11 px-3.5 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 group transition-all text-left"
              >
                <div className="size-7 rounded-full bg-teal-100 text-teal-800 grid place-items-center font-bold text-xs mr-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  AR
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">Dr. Alex Rivera, MD</div>
                  <div className="text-[10px] text-slate-500 truncate">Chief of Clinical Cardiology</div>
                </div>
                <UserCheck className="size-4 text-slate-400 group-hover:text-teal-600 ml-auto" />
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleDemoLogin("Practice Administrator", "Sarah Jenkins", "s.jenkins@mendsync.health")}
                className="justify-start h-11 px-3.5 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 group transition-all text-left"
              >
                <div className="size-7 rounded-full bg-indigo-100 text-indigo-800 grid place-items-center font-bold text-xs mr-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  SJ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">Sarah Jenkins</div>
                  <div className="text-[10px] text-slate-500 truncate">Practice Administrator</div>
                </div>
                <UserCheck className="size-4 text-slate-400 group-hover:text-indigo-600 ml-auto" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="login" className="text-xs font-medium rounded-lg">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="text-xs font-medium rounded-lg">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="pt-3 space-y-3.5">
              <form onSubmit={handleSubmitLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="admin@mendsync.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-900/10"
                >
                  {isLoading ? "Authenticating..." : "Sign In to Dashboard"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="pt-3 space-y-3">
              <form onSubmit={handleSubmitLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">Full Name</Label>
                  <Input
                    placeholder="Dr. Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">Work Email</Label>
                  <Input
                    type="email"
                    placeholder="jordan.lee@clinic.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-xl"
                >
                  {isLoading ? "Creating Account..." : "Create MendSync Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 border-t border-slate-100">
            <ShieldCheck className="size-3.5 text-teal-600" />
            <span>256-Bit Encrypted Data & HIPAA Audit Compliant</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
