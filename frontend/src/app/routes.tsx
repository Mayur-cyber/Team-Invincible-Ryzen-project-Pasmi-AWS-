import { createBrowserRouter } from "react-router-dom";
import Root from "./layouts/Root";
import { DashboardLayout } from "./layouts/DashboardLayout_clean";
import Landing from "./pages/Landing";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import DashboardOverview from "./pages/dashboard/Overview";
import CreatePost from "./pages/dashboard/CreatePost";
import ConnectedAccounts from "./pages/dashboard/ConnectedAccounts";
import Analytics from "./pages/dashboard/Analytics";
import VideoDetail from "./pages/dashboard/VideoDetail";
import AIInsights from "./pages/dashboard/AIInsights";
import DashboardSettings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        Component: Landing,
      },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "signup",
        Component: SignUpPage,
      },
      {
        path: "dashboard",
        Component: DashboardLayout,
        children: [
          {
            index: true,
            Component: DashboardOverview,
          },
          {
            path: "create",
            Component: CreatePost,
          },
          {
            path: "analytics",
            Component: Analytics,
          },
          {
            path: "analytics/:platform/:id",
            Component: VideoDetail,
          },
          {
            path: "ai-insights",
            Component: AIInsights,
          },
          {
            path: "connected-accounts",
            Component: ConnectedAccounts,
          },
          {
            path: "settings",
            Component: DashboardSettings,
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);