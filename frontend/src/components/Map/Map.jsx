import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = () => {
  const [neighborhood, setNeighborhood] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch neighborhood data for the current user
    const fetchNeighborhoodData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/neighborhoods/current', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setNeighborhood(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching neighborhood data:', error);
        setError('Failed to load neighborhood data');
      }
    };

    fetchNeighborhoodData();
  }, []);

  useEffect(() => {
    // Fetch points of interest based on selected filter
    const fetchPointsOfInterest = async () => {
      if (!neighborhood) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(
          `http://localhost:8000/api/neighborhoods/${neighborhood._id}/points-of-interest?filter=${selectedFilter}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPointsOfInterest(data.points || []);
      } catch (error) {
        console.error('Error fetching points of interest:', error);
        setError('Failed to load points of interest');
      }
    };

    fetchPointsOfInterest();
  }, [neighborhood, selectedFilter]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!neighborhood) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="map-container">
      <div className="filter-buttons">
        <button
          className={selectedFilter === 'all' ? 'active' : ''}
          onClick={() => setSelectedFilter('all')}
        >
          All
        </button>
        <button
          className={selectedFilter === 'hotels' ? 'active' : ''}
          onClick={() => setSelectedFilter('hotels')}
        >
          Hotels
        </button>
        <button
          className={selectedFilter === 'attractions' ? 'active' : ''}
          onClick={() => setSelectedFilter('attractions')}
        >
          Attractions
        </button>
        <button
          className={selectedFilter === 'restaurants' ? 'active' : ''}
          onClick={() => setSelectedFilter('restaurants')}
        >
          Restaurants
        </button>
      </div>
      
      <MapContainer
        center={[neighborhood.coordinates.latitude, neighborhood.coordinates.longitude]}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Neighborhood center marker */}
        <Marker position={[neighborhood.coordinates.latitude, neighborhood.coordinates.longitude]}>
          <Popup>{neighborhood.name}</Popup>
        </Marker>

        {/* Points of interest markers */}
        {pointsOfInterest.map((point) => (
          <Marker
            key={point._id}
            position={[point.coordinates.latitude, point.coordinates.longitude]}
          >
            <Popup>
              <h3>{point.name}</h3>
              <p>{point.description}</p>
              <p>Category: {point.category}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;