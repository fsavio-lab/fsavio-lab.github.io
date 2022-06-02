import logo from './logo.svg';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import Card from './Components/Card/Card';
import './App.css';


//Helllo dasfasdf
function App() {
  return (
    <div className="App">
      <Header/>
      <div className="Project">
        <h2>Projects</h2>
        <div className="card-section">
          <Card/>
          <Card/>
          <Card/>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default App;
