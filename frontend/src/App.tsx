// App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/index";
import PublicRouter from "./routes/publicRouter";
import PrivateRouter from "./routes/privateRouter";
import { NotificationProvider } from './components/common/Notification.tsx';


function App() {
  return (
    <NotificationProvider>
      <Provider store={store}>
        <Router>
          <PublicRouter />
          <PrivateRouter />
        </Router>
      </Provider>
    </NotificationProvider>
  );
}

export default App;