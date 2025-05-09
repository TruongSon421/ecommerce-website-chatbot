// App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/index";
import PublicRouter from "./routes/publicRouter";
import PrivateRouter from "./routes/privateRouter";


function App() {
  return (
    <Provider store={store}>
      <Router>
        <PublicRouter />
        <PrivateRouter />
      </Router>
    </Provider>
  );
}

export default App;