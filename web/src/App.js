import React from 'react';
import logo from './images/blues_wireless_logo.png';
import './styles/App.css';
import MapContainer from './components/MapContainer.js';
import firebase from 'firebase';
import { getFirebaseConfig } from './keys';
require('firebase/firestore');

if (!firebase.apps.length) {
  let firebaseConfig = getFirebaseConfig;
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

let db = firebase.firestore();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: '',
    };
  }

  componentDidMount() {
    const getCityName = async () => {
      let mapData = db.collection('mapdata');
      let rec = await mapData.limit(1).get();
      this.setState({ location: rec.docs[0].get('location') });
    };
    getCityName();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Cell Signal Heatmap near {this.state.location}</p>
          <div className="Map">
            <MapContainer></MapContainer>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
