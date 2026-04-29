import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { RouteFallback } from "@/components/system/RouteFallback";

// Eager: home + auth (first paint)
import Index from "./pages/Index.tsx";
import Login from "./pages/auth/Login.tsx";
import Signup from "./pages/auth/Signup.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy: everything else
const Browse = lazy(() => import("./pages/Browse.tsx"));
const Search = lazy(() => import("./pages/Search.tsx"));
const Categories = lazy(() => import("./pages/Categories.tsx"));
const CategoryPage = lazy(() => import("./pages/CategoryPage.tsx"));
const Chat = lazy(() => import("./pages/Chat.tsx"));
const ChatRoom = lazy(() => import("./pages/ChatRoom.tsx"));
const Notifications = lazy(() => import("./pages/Notifications.tsx"));
const Saved = lazy(() => import("./pages/Saved.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const EditProfile = lazy(() => import("./pages/EditProfile.tsx"));
const CreateListing = lazy(() => import("./pages/CreateListing.tsx"));
const ListingDetail = lazy(() => import("./pages/ListingDetail.tsx"));
const Safety = lazy(() => import("./pages/Safety.tsx"));
const Help = lazy(() => import("./pages/Help.tsx"));
const MyListings = lazy(() => import("./pages/MyListings.tsx"));
const SettingsPage = lazy(() => import("./pages/Settings.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Public app shell */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/listing/:id" element={<ListingDetail />} />
                  <Route path="/safety" element={<Safety />} />
                </Route>

                {/* Protected app shell */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/help" element={<Help />} />
                    <Route path="/messages" element={<Chat />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/chat/:id" element={<ChatRoom />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/create-listing" element={<CreateListing />} />
                    <Route path="/my-listings" element={<MyListings />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
