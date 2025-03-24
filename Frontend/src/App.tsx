import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import  store  from "./store/index";
import { publicRouter } from "./routes/publicRouter";
import { privateRouter } from "./routes/privateRouter";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Render public routes */}
          {publicRouter.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
              {route.children?.map((child, idx) => (
                <Route key={idx} path={child.path} element={child.element} />
              ))}
            </Route>
          ))}

          {/* Render private routes */}
          {privateRouter.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
              {/* {route.children?.map((child, idx) => (
                <Route key={idx} path={child.path} element={child.element} />
              ))} */}
            </Route>
          ))}
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;