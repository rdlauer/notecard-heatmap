import React from 'react';
import { GoogleMap, HeatmapLayer } from '@react-google-maps/api';
import firebase from 'firebase';
require('firebase/firestore');

const google = window.google;

const containerStyle = {
  width: '800px',
  height: '600px',
};

const options = {
  radius: 40,
};

let db = firebase.firestore();

// const testPoints = [
//   { location: new google.maps.LatLng(37.782, -122.447), weight: 4 },
//   { location: new google.maps.LatLng(37.782, -122.443), weight: 2 },
//   { location: new google.maps.LatLng(37.782, -122.441), weight: 3 },
//   { location: new google.maps.LatLng(37.782, -122.439), weight: 2 },
//   { location: new google.maps.LatLng(37.782, -122.435), weight: 1 },
//   { location: new google.maps.LatLng(37.785, -122.447), weight: 3 },
//   { location: new google.maps.LatLng(37.785, -122.445), weight: 2 },
//   { location: new google.maps.LatLng(37.785, -122.441), weight: 1 },
//   { location: new google.maps.LatLng(37.785, -122.437), weight: 2 },
//   { location: new google.maps.LatLng(37.785, -122.435), weight: 3 },
// ];

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapPoints: [],
      center: {},
    };
  }

  componentDidMount() {
    const fetchPoints = async () => {
      let pointArray = [];
      let mapCenter = {};

      let mapData = db.collection('mapdata');
      let allPoints = await mapData.get();

      for (const doc of allPoints.docs) {
        // for simplicity sake, our map "center" will just be the first record
        if (Object.keys(mapCenter).length === 0) {
          mapCenter = {
            lat: doc.get('lat'),
            lng: doc.get('lon'),
          };
        }

        let point = {
          location: new google.maps.LatLng(doc.get('lat'), doc.get('lon')),
          weight: doc.get('bars'),
        };

        pointArray.push(point);
      }

      this.setState({ center: mapCenter });
      this.setState({ mapPoints: pointArray });
    };
    fetchPoints();
  }

  render() {
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={this.state.center}
        zoom={13}
        mapTypeId={'satellite'}
      >
        <HeatmapLayer data={this.state.mapPoints} options={options} />
      </GoogleMap>
    );
  }
}

export default Map;
