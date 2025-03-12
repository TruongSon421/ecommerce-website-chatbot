import Home from "./pages/home";
import PageCategory from "./pages/categories";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProductGH from "./pages/productDetail";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ChatWidget from "./components/chatbotWidget";
function App() {
  return (
    <Router>
        <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:type" element={<PageCategory/>} />
      <Route path="/phone/:phone_name" element={<ProductGH />}/>
    </Routes>
        <ChatWidget />
        <Footer />
  </Router>
    
  );
}



export default App

