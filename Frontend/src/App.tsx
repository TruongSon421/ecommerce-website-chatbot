import Home from "./pages/home";
import PageCategory from "./pages/categories";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProductGH from "./pages/productDetail";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ChatWidget from "./components/chatbotWidget";
import Login from "./components/user/login";
import Register from "./components/user/register";
import { AuthProvider } from "./components/auth/authContexts";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/:type" element={<PageCategory/>} />
          <Route path="/phone/:phone_id" element={<ProductGH />}/>
        </Routes>
        <ChatWidget />
        <Footer />
      </Router>
    </AuthProvider>
    
    
  );
}


export default App

