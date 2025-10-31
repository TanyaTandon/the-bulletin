import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { Helmet } from "react-helmet";
import Index from "./pages/Index";
import SignUp from "./pages/Signup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BulletinPage from "./pages/bulletin";
import FilledBulletin from "./pages/filledBulletin";
import Test from "./pages/test";
import Register from "./pages/Register";
import ProviderProvider from "./providers/ProviderProvider";
import { Route, Routes } from "react-router";
import Catalogue from "./pages/catalogue";

const App = () => {

  window.addEventListener('load', function() {
    setTimeout(function() {
      window.scrollTo(0, 1);
    }, 0);
  });
  return (
    <ProviderProvider>
      <Helmet>
        <link rel="icon" href="/BulletinLogoICON.svg" />
        <title>The Bulletin</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        ></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
        <meta
          name="description"
          content="Share your moments with friends and family through our monthly bulletin service"
        />
      </Helmet>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/register" element={<Index key="register" />} />
        <Route path="/register/:id" element={<Register key="register" />} />
        <Route path="/" element={<Index key="index" />} />
        <Route path="/signup" element={<SignUp key="signup" />} />
        <Route path="/settings" element={<Settings key="settings" />} />
        <Route path="/anon" element={<BulletinPage key="bulletin" />} />
        <Route path="/bulletin" element={<BulletinPage key="bulletin" />} />
        <Route
          path="/bulletin/:id"
          element={<FilledBulletin key="filled-bulletin" />}
        />
        <Route path="/catalogue" element={<Catalogue key="catalogue" />} />
        <Route path="/test" element={<Test key="test" />} />
        <Route path="*" element={<NotFound key="not-found" />} />
      </Routes>
    </ProviderProvider>
  );
};

export default App;
