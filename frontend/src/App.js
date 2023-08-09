import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material';
import Homepage from "./pages/Homepage";
import About from "./pages/About";

const theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
});

const App = () => {

    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
