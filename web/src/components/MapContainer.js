import React, { Suspense } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { getGoogleMapsKey } from '../keys';
const Map = React.lazy(() => import('./Map.js'));

class MapContainer extends React.Component {
  render() {
    return (
      <LoadScript
        googleMapsApiKey={getGoogleMapsKey}
        libraries={['visualization']}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <Map></Map>
        </Suspense>
      </LoadScript>
    );
  }
}

export default MapContainer;
