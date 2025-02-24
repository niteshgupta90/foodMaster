import axios from 'axios'; // or your configured instance

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

async function geocodeAddress(address) {
  const encoded = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}`;

  const res = await axios.get(url);
  if (res.data.features && res.data.features.length > 0) {
    const [lon, lat] = res.data.features[0].center;
    return { lat, lon };
  } else {
    throw new Error('Location not found');
  }
}

export default geocodeAddress;
