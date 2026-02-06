import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy } from "react";
import PageTransition from "./PageTransition";
import PageLoader from "./PageLoader";

// Lazy load all pages for code splitting
const Index = lazy(() => import("@/pages/Index"));
const Visualizer = lazy(() => import("@/pages/Visualizer"));
const Demo = lazy(() => import("@/pages/Demo"));
const Docs = lazy(() => import("@/pages/Docs"));
const Auth = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Index />
              </PageTransition>
            }
          />
          <Route
            path="/visualizer"
            element={
              <PageTransition>
                <Visualizer />
              </PageTransition>
            }
          />
          <Route
            path="/demo"
            element={
              <PageTransition>
                <Demo />
              </PageTransition>
            }
          />
          <Route
            path="/docs"
            element={
              <PageTransition>
                <Docs />
              </PageTransition>
            }
          />
          <Route
            path="/auth"
            element={
              <PageTransition>
                <Auth />
              </PageTransition>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
