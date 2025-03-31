// import React, { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import './Map.css';
// import { pointsOfInterestData } from '../../config/pointsOfInterest';

// // Fix for default marker icons in Leaflet with React
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// const Map = () => {
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [pointsOfInterest, setPointsOfInterest] = useState([]);
//   const defaultCenter = {
//     coordinates: {
//       latitude: 12.8837632,
//       longitude: 77.5731631
//     },
//     name: 'JP Nagar, Bengaluru'
//   };

//   useEffect(() => {
//     // Filter points of interest based on selected category
//     if (selectedFilter === 'all') {
//       setPointsOfInterest([
//         ...pointsOfInterestData.hotels,
//         ...pointsOfInterestData.attractions,
//         ...pointsOfInterestData.restaurants,
//         ...pointsOfInterestData.services
//       ]);
//     } else {
//       setPointsOfInterest(pointsOfInterestData[selectedFilter] || []);
//     }
//   }, [selectedFilter]);


//   return (
//     <div className="map-container">
//       <div className="filter-buttons">
//         <button
//           className={selectedFilter === 'all' ? 'active' : ''}
//           onClick={() => setSelectedFilter('all')}
//         >
//           All
//         </button>
//         <button
//           className={selectedFilter === 'hotels' ? 'active' : ''}
//           onClick={() => setSelectedFilter('hotels')}
//         >
//           Hotels
//         </button>
//         <button
//           className={selectedFilter === 'attractions' ? 'active' : ''}
//           onClick={() => setSelectedFilter('attractions')}
//         >
//           Attractions
//         </button>
//         <button
//           className={selectedFilter === 'restaurants' ? 'active' : ''}
//           onClick={() => setSelectedFilter('restaurants')}
//         >
//           Restaurants
//         </button>
//         <button
//           className={selectedFilter === 'services' ? 'active' : ''}
//           onClick={() => setSelectedFilter('services')}
//         >
//           Services
//         </button>
//       </div>
      
//       <MapContainer
//         center={[defaultCenter.coordinates.latitude, defaultCenter.coordinates.longitude]}
//         zoom={15}
//         style={{ height: '600px', width: '100%' }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
        
//         {/* Neighborhood center marker */}
//         <Marker 
//           position={[defaultCenter.coordinates.latitude, defaultCenter.coordinates.longitude]}
//           icon={L.divIcon({
//             className: 'neighborhood-marker',
//             html: '📍',
//             iconSize: [30, 30],
//             iconAnchor: [15, 30]
//           })}
//         >
//           <Popup>
//             <h3>{defaultCenter.name}</h3>
//             <p>Central location of JP Nagar</p>
//           </Popup>
//         </Marker>

//         {/* Points of interest markers */}
//         {pointsOfInterest.map((point) => (
//           <Marker
//             key={point._id}
//             position={[point.coordinates.latitude, point.coordinates.longitude]}
//             icon={L.divIcon({
//               className: `poi-marker ${point.category}`,
//               html: point.category === 'hotels' ? '🏨' : point.category === 'restaurants' ? '🍽️' : point.category === 'services' ? '🔧' : '🎯',
//               iconSize: [30, 30],
//               iconAnchor: [15, 30]
//             })}
//           >
//             <Popup>
//               <div className="poi-popup">
//                 <h3>{point.name}</h3>
//                 <p>{point.description}</p>
//                 <p className="category">Category: {point.category}</p>
//                 {point.specialization && <p>Specialization: {point.specialization}</p>}
//                 {point.contactInfo?.phone && <p>Contact: {point.contactInfo.phone}</p>}
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// };

// export default Map;


import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css';
import { pointsOfInterestData } from '../../config/pointsOfInterest';
import { Map as MapIcon, Hotel, Utensils, Compass, Wrench } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different categories
const createCustomIcon = (category) => {
  const colors = {
    hotels: '#9b87f5',
    restaurants: '#F97316',
    attractions: '#0EA5E9',
    services: '#F1F1F1',
    neighborhood: '#333333'
  };
  
  const icons = {
    hotels: '🏨',
    restaurants: '🍽️',
    attractions: '🎯',
    services: '🔧',
    neighborhood: '📍'
  };
  
  return L.divIcon({
    className: `custom-marker ${category}`,
    html: `<div style="background-color: ${colors[category] || '#333333'}; color: white;">${icons[category]}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const Map = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  const defaultCenter = {
    coordinates: {
      latitude: 12.8837632,
      longitude: 77.5731631
    },
    name: 'JP Nagar, Bengaluru'
  };

  useEffect(() => {
    // Filter points of interest based on selected category
    if (selectedFilter === 'all') {
      setPointsOfInterest([
        ...pointsOfInterestData.hotels,
        ...pointsOfInterestData.attractions,
        ...pointsOfInterestData.restaurants,
        ...pointsOfInterestData.services
      ]);
    } else {
      setPointsOfInterest(pointsOfInterestData[selectedFilter] || []);
    }
  }, [selectedFilter]);

  return (
    <div className="map-container">
      <div className="map-header">
        <h2>Neighborhood Map</h2>
        <p>Explore points of interest in and around JP Nagar</p>
      </div>
      
      <div className="filter-buttons">
        <button
          className={selectedFilter === 'all' ? 'active' : ''}
          onClick={() => setSelectedFilter('all')}
        >
          <MapIcon size={16} />
          <span>All</span>
        </button>
        <button
          className={selectedFilter === 'hotels' ? 'active' : ''}
          onClick={() => setSelectedFilter('hotels')}
        >
          <Hotel size={16} />
          <span>Hotels</span>
        </button>
        <button
          className={selectedFilter === 'attractions' ? 'active' : ''}
          onClick={() => setSelectedFilter('attractions')}
        >
          <Compass size={16} />
          <span>Attractions</span>
        </button>
        <button
          className={selectedFilter === 'restaurants' ? 'active' : ''}
          onClick={() => setSelectedFilter('restaurants')}
        >
          <Utensils size={16} />
          <span>Restaurants</span>
        </button>
        <button
          className={selectedFilter === 'services' ? 'active' : ''}
          onClick={() => setSelectedFilter('services')}
        >
          <Wrench size={16} />
          <span>Services</span>
        </button>
      </div>
      
      <div className="map-legend">
        <h4>Map Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-marker neighborhood">📍</div>
            <span>Neighborhood Center</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker hotels">🏨</div>
            <span>Hotels</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker restaurants">🍽️</div>
            <span>Restaurants</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker attractions">🎯</div>
            <span>Attractions</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker services">🔧</div>
            <span>Services</span>
          </div>
        </div>
      </div>
      
      <div className="map-wrapper">
        <MapContainer
          center={[defaultCenter.coordinates.latitude, defaultCenter.coordinates.longitude]}
          zoom={15}
          style={{ height: '600px', width: '100%' }}
          className="leaflet-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Neighborhood center marker */}
          <Marker 
            position={[defaultCenter.coordinates.latitude, defaultCenter.coordinates.longitude]}
            icon={createCustomIcon('neighborhood')}
          >
            <Popup>
              <div className="poi-popup">
                <h3>{defaultCenter.name}</h3>
                <p>Central location of JP Nagar</p>
              </div>
            </Popup>
          </Marker>

          {/* Points of interest markers */}
          {pointsOfInterest.map((point) => (
            <Marker
              key={point._id}
              position={[point.coordinates.latitude, point.coordinates.longitude]}
              icon={createCustomIcon(point.category)}
            >
              <Popup>
                <div className="poi-popup">
                  <h3>{point.name}</h3>
                  <p>{point.description}</p>
                  <p className="category">Category: {point.category}</p>
                  {point.specialization && <p>Specialization: {point.specialization}</p>}
                  {point.contactInfo?.phone && <p>Contact: {point.contactInfo.phone}</p>}
                  {point.address && <p className="address">{point.address}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
