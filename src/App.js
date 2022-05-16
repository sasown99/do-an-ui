import logo from "./logo.svg";
import "./App.scss";
import "./assets/css/base.scss";
import "./displacy-ent/assets/css/displacy-ent.scss";
import Header from "./component/Header";
import Content from "./component/Content";
import Footer from "./component/Footer";

function App() {
  return (
    <div className="App">
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

export default App;
