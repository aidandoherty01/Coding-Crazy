import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import GamePage from "./components/GamePage";
import StudyPage from "./components/StudyPage";
import LobbyPage from "./components/LobbyPage";
import HostPage from "./components/HostPage";
import LoginPage  from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import StyleWrapper from "./components/StyleWrapper";

function App() {
    return (
        <StyleWrapper>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/game" element={<GamePage />} />
                    <Route path="/study" element={<StudyPage />} />
                    <Route path="/lobby/:accessCode" element={<LobbyPage />} />
                    <Route path="/setupGame" element={<HostPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                </Routes>
            </Router>
        </StyleWrapper>
    );
}

export default App;
