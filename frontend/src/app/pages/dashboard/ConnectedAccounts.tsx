import { useState, useEffect } from "react";
import {
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardTitle, CardDescription } from "../../components/ui/card";
import { dashboardApi, Integration } from "../../services/dashboardApi";
import { toast } from "sonner";
import { useUser } from "../../contexts/UserContext"; // Needed to retrieve the active JWT

const AVAILABLE_ACCOUNTS = [
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: Twitter,
    color: "text-black",
    bg: "bg-gray-50",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-700",
    bg: "bg-blue-50",
  }
];

export default function ConnectedAccounts() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Need to call useUser to ensure the session is loaded, but we fetch token from localStorage directly
  useUser();

  // On mount, check URL parameters for OAuth callbacks and fetch current integrations
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const successPlatform = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (successPlatform) {
      toast.success(`${successPlatform} securely connected!`);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam) {
      toast.error(`Connection failed: ${errorParam}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardApi.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error("Failed to load integrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectClick = (platformId: string) => {
    // Determine the base backend URL
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // Forward the current user session token as the `state` parameter
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error("You must be logged in to connect accounts.");
      return;
    }

    // Redirect the browser entirely to kickoff the OAuth Handshake
    window.location.href = `${backendUrl}/api/integrations/${platformId}/auth?token=${token}`;
  };

  const handleDisconnectClick = async (platformId: string) => {
    try {
      await dashboardApi.deleteIntegration(platformId);
      setIntegrations(prev => prev.filter(inv => inv.platform !== platformId));
      toast.success(`Disconnected from ${platformId}`);
    } catch (error) {
      console.error("Failed to disconnect:", error);
      toast.error("Failed to disconnect");
    }
  };

  const isConnected = (platformId: string) => {
    return integrations.some(inv => inv.platform === platformId);
  };

  const getIntegrationDetails = (platformId: string) => {
    return integrations.find(inv => inv.platform === platformId);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#3A4D50]">Connected Accounts</h2>
        <p className="text-gray-500">Securely link your platforms via industry-standard OAuth 2.0.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#3A4D50]" />
        </div>
      ) : (
        <div className="grid gap-6">
          {AVAILABLE_ACCOUNTS.map((account) => {
            const connected = isConnected(account.id);
            return (
              <Card key={account.id} className="flex flex-col sm:flex-row items-center justify-between p-6 gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${account.bg} ${account.color}`}>
                    <account.icon size={32} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#3A4D50]">{account.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {connected ? (
                        <span className="flex items-center text-green-600 gap-1 mt-1">
                          <CheckCircle2 size={14} /> Secured via OAuth
                        </span>
                      ) : (
                        <span className="mt-1 block">Not connected</span>
                      )}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <Button
                    variant={connected ? "outline" : "default"}
                    onClick={() => connected ? handleDisconnectClick(account.id) : handleConnectClick(account.id)}
                    className={connected
                      ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      : "bg-[#3A4D50] hover:bg-[#2F3E40] text-white"
                    }
                  >
                    {connected ? "Disconnect" : "Connect API"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}