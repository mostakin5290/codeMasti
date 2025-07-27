
import { Navigate, Routes, Route, useLocation } from "react-router-dom"; // Import useLocation
import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from './features/auth/authSlice';

// --- Theme Imports ---
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// --- Page Imports ---
import FrontPage from "./Pages/FrontPage";
import Login from "./features/auth/Login";
import SignUp from "./features/auth/SignUp";
import Home from "./Pages/Home";
import ProblemPage from "./Pages/ProblemPage";
import ContestsPage from "./Pages/ContestsPage";
import DiscussPage from "./Pages/DiscussPage";
import Setting from "./Pages/SettingPage";
import ProfilePage from "./Pages/Profile";
import Codefield from "./Pages/Codefield"; // Existing Codefield
import AboutPage from "./components/FooterPage/CodeCrack/AboutPage";
import TermsPage from "./components/FooterPage/Legal/TermsPage";
import PrivacyPolicyPage from "./components/FooterPage/Legal/PrivacyPolicyPage";
import CookiePolicyPage from "./components/FooterPage/Legal/CookiePolicyPage";
import CreateDiscussPost from "./features/discuss/CreateDiscussPost";
import DiscussPostDetail from "./features/discuss/DiscussPostDetail";
import GitHubCallback from './features/auth/GitHubCallback';
import ExplorePremium from "./components/Premium/ExplorePremium";

// --- Component Imports ---
import Loading from "./components/common/Loading";
import AdminRoute from "./route/AdminRoute";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// --- Admin Panel Imports ---
import AdminLayout from "./Pages/AdminLayout";
import AdminDashboardPage from "./components/Admin/AdminDashboardPage";
import AdminUsersPage from "./components/Admin/AdminUsersPage";
import AdminSiteSettingsPage from "./components/Admin/AdminSiteSettingsPage";
import ProblemList from "./components/Admin/ProblemList";
import CreateProblem from "./components/Admin/problems/CreateProblem";
import EditProblem from "./components/Admin/problems/EditProblem";
import NotFound from "./Pages/NotFound";
import EditProfile from "./components/Profile/EditProfile";
import HelpCenter from "./components/FooterPage/Support/HelpCenter";
import ContactUs from "./components/FooterPage/Support/ContactUs";
import FAQsPage from "./components/FooterPage/Support/FAQsPage";
import AIChatPage from "./components/FooterPage/Support/AIChatPage";
import PremiumPage from "./Pages/PremiumPage";
import SubscribePage from "./Pages/SubscribePage";
import DailyChallengeAdmin from "./components/Admin/DailyChallenge/DailyChallengeAdmin";
import ContestManagement from "./components/Admin/ContestManagement";
import ContestForm from "./components/Admin/contest/ContestForm";
import ContestDetails from "./components/Admin/contest/ContestDetails";
import ContestLeaderboardPage from "./components/Contest/ContestLeaderboardPage";
import ContestParticipationPage from "./components/Contest/ContestParticipationPage";
import ContestPublicDetailsPage from "./components/Admin/contest/ContestPublicDetailsPage";
import PlaylistPage from "./Pages/PlaylisPage";
import ForgotPassword from "./features/auth/ForgotPassword";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import { AnimationProvider } from "./context/AnimationContext";
import PremiumWelcomePage from "./Pages/PremiumWelcomePage";
import ComingSoonPage from "./components/common/ComingSoon";
import RankPage from "./components/Profile/RankPage";
import GamePage from "./Pages/GamePage"; 
import GameCodefield from "./Pages/GameCodefield"; 
import GameRoomDetailsPage from "./Pages/GameRoomDetailsPage"; 


const AppRoutes = () => {
    const { theme } = useTheme();
    // Destructure user from auth state
    const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    if (loading) {
        return (
            <><Loading /></>
        );
    }


    // Check if the user is authenticated AND premium
    const isUserPremium = isAuthenticated && user?.isPremium;

    return (
        <div className={`min-h-screen font-sans ${theme.text} transition-colors duration-300`}>
            <Routes>
                <Route path="*" element={<NotFound />} />

                {/* --- Public & User Routes --- */}
                <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <FrontPage />} />
                <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} />

                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />


                <Route
                    path="/premium"
                    element={isUserPremium ? <Navigate to="/home" replace /> : <PremiumPage />}
                />

                <Route
                    path="/subscribe/:planType"
                    element={
                        isUserPremium ? (
                            <Navigate to="/home" replace />
                        ) : isAuthenticated ? (
                            <SubscribePage />
                        ) : (
                            <Navigate
                                to="/login"
                                replace
                                state={{ from: location.pathname, message: "Please log in to continue your subscription." }}
                            />
                        )
                    }
                />

                <Route path="/github/callback" element={<GitHubCallback />} />
                <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <SignUp />} />
                <Route path="/problems" element={isAuthenticated ? <ProblemPage /> : <Navigate to="/" />} />
                <Route path="/playlist/:playlistId" element={isAuthenticated ? <PlaylistPage /> : <Navigate to="/" />} />
                <Route path="/contests" element={isAuthenticated ? <ContestsPage /> : <Navigate to="/" />} />
                <Route path="/discuss" element={isAuthenticated ? <DiscussPage /> : <Navigate to="/" />} />
                <Route path="/discuss/new" element={isAuthenticated ? <CreateDiscussPost /> : <Navigate to="/" />} />
                <Route path="/discuss/edit/:slug" element={isAuthenticated ? <CreateDiscussPost /> : <Navigate to="/" />} />
                <Route path="/discuss/:slug" element={isAuthenticated ? <DiscussPostDetail /> : <Navigate to="/" />} />
                <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" />} />
                <Route path="/profile/edit" element={isAuthenticated ? <EditProfile /> : <Navigate to="/" />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/settings" element={isAuthenticated ? <Setting /> : <Navigate to="/" />} />
                <Route path="/codefield/:problemId" element={isAuthenticated ? <Codefield /> : <Navigate to="/" />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/cookies" element={<CookiePolicyPage />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/help/faq" element={<FAQsPage />} />
                <Route path="/help/chat" element={<AIChatPage />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/contests/:id/participate" element={<ContestParticipationPage />} />
                <Route path="/contests/:id/leaderboard" element={<ContestLeaderboardPage />} />
                <Route path="/contests/:id" element={<ContestPublicDetailsPage />} />
                <Route path="/explore-premium" element={<ExplorePremium />} />
                <Route path="/test" element={<PremiumWelcomePage />} />
                <Route path="/coming" element={<ComingSoonPage />} />
                <Route path="/world-rank" element={<RankPage />} />

                {/* NEW GAME ROUTES */}
                <Route path="/game" element={isAuthenticated ? <GamePage /> : <Navigate to="/" />} />
                <Route path="/game/room/:roomId" element={isAuthenticated ? <GameRoomDetailsPage /> : <Navigate to="/" />} />
                <Route path="/game/room/:roomId/play" element={isAuthenticated ? <GameCodefield /> : <Navigate to="/" />} />

                {/* --- Admin Routes --- */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="problems" element={<ProblemList />} />
                        <Route path="problems/create" element={<CreateProblem />} />
                        <Route path="problems/edit/:id" element={<EditProblem />} />
                        <Route path="settings" element={<AdminSiteSettingsPage />} />
                        <Route path="daily-challenges" element={<DailyChallengeAdmin />} />
                        <Route path="contests" element={<ContestManagement />} />
                        <Route path="contests/create" element={<ContestForm />} />
                        <Route path="contests/:id/edit" element={<ContestForm isEdit />} />
                        <Route path="contests/:id" element={<ContestDetails />} />
                    </Route>
                </Route>
            </Routes>
        </div>
    );
};


const App = () => {
    return (
        <ThemeProvider>
            <AnimationProvider>
                <AppRoutes />
            </AnimationProvider>
        </ThemeProvider>
    );
};

export default App;
