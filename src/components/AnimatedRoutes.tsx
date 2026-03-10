import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy } from "react";
import PageTransition from "./PageTransition";
import PageLoader from "./PageLoader";
import ProtectedRoute from "./ProtectedRoute";

const Index = lazy(() => import("@/pages/Index"));
const Visualizer = lazy(() => import("@/pages/Visualizer"));
const Demo = lazy(() => import("@/pages/Demo"));
const Docs = lazy(() => import("@/pages/Docs"));
const Auth = lazy(() => import("@/pages/Auth"));
const Learn = lazy(() => import("@/pages/Learn"));
const LearnModule = lazy(() => import("@/pages/LearnModule"));
const Simulations = lazy(() => import("@/pages/Simulations"));
const Placement = lazy(() => import("@/pages/Placement"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AITutor = lazy(() => import("@/pages/AITutor"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Faculty = lazy(() => import("@/pages/Faculty"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const wrap = (el: React.ReactNode) => <PageTransition>{el}</PageTransition>;

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={wrap(<Index />)} />
          <Route path="/demo" element={wrap(<Demo />)} />
          <Route path="/docs" element={wrap(<Docs />)} />
          <Route path="/auth" element={wrap(<Auth />)} />

          {/* Student routes (auth required) */}
          <Route path="/dashboard" element={wrap(<ProtectedRoute allowedRoles={["student"]}><Dashboard /></ProtectedRoute>)} />
          <Route path="/visualizer" element={wrap(<ProtectedRoute><Visualizer /></ProtectedRoute>)} />
          <Route path="/learn" element={wrap(<ProtectedRoute><Learn /></ProtectedRoute>)} />
          <Route path="/learn/:moduleId" element={wrap(<ProtectedRoute><LearnModule /></ProtectedRoute>)} />
          <Route path="/simulations" element={wrap(<ProtectedRoute><Simulations /></ProtectedRoute>)} />
          <Route path="/placement" element={wrap(<ProtectedRoute><Placement /></ProtectedRoute>)} />
          <Route path="/ai-tutor" element={wrap(<ProtectedRoute><AITutor /></ProtectedRoute>)} />
          <Route path="/quiz" element={wrap(<ProtectedRoute><Quiz /></ProtectedRoute>)} />
          <Route path="/analytics" element={wrap(<ProtectedRoute><Analytics /></ProtectedRoute>)} />

          {/* Faculty-only route */}
          <Route path="/faculty" element={wrap(<ProtectedRoute allowedRoles={["faculty"]}><Faculty /></ProtectedRoute>)} />

          <Route path="*" element={wrap(<NotFound />)} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
