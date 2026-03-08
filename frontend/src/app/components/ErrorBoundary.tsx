import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

export function ErrorBoundary() {
  const error = useRouteError();
  console.error("Router Error:", error);

  let title = "Unexpected Error";
  let message = "Something went wrong. Please try again later.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "404 - Not Found";
      message = "The page you are looking for doesn't exist or has been moved.";
    } else if (error.status === 401) {
      title = "401 - Unauthorized";
      message = "You aren't authorized to see this page.";
    } else if (error.status === 503) {
      title = "503 - Service Unavailable";
      message = "Looks like our API is down.";
    } else if (error.status === 418) {
      title = "418 - I'm a teapot";
      message = "☕️";
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2EB] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-[#8FA58F]/20 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#3A4D50] mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-[#8FA58F] hover:bg-[#7A9080] text-white rounded-xl py-6 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={20} />
            Try Again
          </Button>
          
          <Link to="/" className="w-full">
            <Button 
              variant="outline" 
              className="w-full border-[#8FA58F] text-[#8FA58F] hover:bg-[#8FA58F]/5 rounded-xl py-6 flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Go Home
            </Button>
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && error instanceof Error && (
          <div className="mt-8 text-left">
            <p className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">Error Stack</p>
            <div className="bg-gray-50 p-4 rounded-xl overflow-auto max-h-40 text-xs font-mono text-red-400 border border-red-100">
              {error.stack}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
