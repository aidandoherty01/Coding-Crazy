import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import GamePage from "./components/GamePage";
import StudyPage from "./components/StudyPage";
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
                </Routes>
            </Router>
        </StyleWrapper>
    );
}

export default App;
