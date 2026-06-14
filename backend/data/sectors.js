// Predefined geographical node layouts and connectivity networks for cities
const rawEdgesTemplate = [
  { id: 'e1', source: 'n9', target: 'n2', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e2', source: 'n2', target: 'n1', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e3', source: 'n1', target: 'n3', traffic: 'moderate', speedLimit: 40, lanes: 2 },
  { id: 'e4', source: 'n3', target: 'n6', traffic: 'clear', speedLimit: 50, lanes: 3 },
  { id: 'e5', source: 'n6', target: 'n8', traffic: 'heavy', speedLimit: 40, lanes: 1 },
  { id: 'e6', source: 'n8', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e7', source: 'n5', target: 'n7', traffic: 'jammed', speedLimit: 50, lanes: 2 },
  { id: 'e8', source: 'n7', target: 'n4', traffic: 'clear', speedLimit: 40, lanes: 2 },
  { id: 'e9', source: 'n4', target: 'n9', traffic: 'clear', speedLimit: 60, lanes: 3 },
  { id: 'e10', source: 'n1', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e11', source: 'n2', target: 'n5', traffic: 'heavy', speedLimit: 60, lanes: 2 },
  { id: 'e12', source: 'n3', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e13', source: 'n4', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e14', source: 'n6', target: 'n5', traffic: 'moderate', speedLimit: 45, lanes: 2 },
  { id: 'e15', source: 'n1', target: 'n4', traffic: 'clear', speedLimit: 40, lanes: 2 },
  { id: 'e16', source: 'n3', target: 'n4', traffic: 'clear', speedLimit: 40, lanes: 2 }
];

const sectors = {
  tirupati: {
    id: 'tirupati',
    name: 'Tirupati',
    country: 'India',
    center: [13.628, 79.419],
    nodes: [
      { id: 'n1', name: 'Alipiri Toll Gate', lat: 13.6500, lng: 79.4005, trafficLight: 'green', lightTimer: 8 },
      { id: 'n2', name: 'Kapila Theertham Junction', lat: 13.6465, lng: 79.4180, trafficLight: 'red', lightTimer: 5 },
      { id: 'n3', name: 'Leela Mahal Circle', lat: 13.6355, lng: 79.4260, trafficLight: 'green', lightTimer: 6 },
      { id: 'n4', name: 'Tirupati RTC Bus Stand', lat: 13.6255, lng: 79.4190, trafficLight: 'red', lightTimer: 10 },
      { id: 'n5', name: 'Tirupati Railway Station', lat: 13.6276, lng: 79.4208, trafficLight: 'green', lightTimer: 4 },
      { id: 'n6', name: 'Ramanuja Circle', lat: 13.6253, lng: 79.4312, trafficLight: 'red', lightTimer: 7 },
      { id: 'n7', name: 'SV University Campus', lat: 13.6280, lng: 79.4020, trafficLight: 'green', lightTimer: 6 },
      { id: 'n8', name: 'Karakambadi Road Junction', lat: 13.6470, lng: 79.4420, trafficLight: 'red', lightTimer: 9 },
      { id: 'n9', name: 'Srinivasam Complex Hub', lat: 13.6265, lng: 79.4255, trafficLight: 'green', lightTimer: 8 }
    ],
    edges: JSON.parse(JSON.stringify(rawEdgesTemplate))
  },
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    country: 'India',
    center: [17.4140, 78.4400],
    nodes: [
      { id: 'n1', name: 'Hitech City Cyber Towers', lat: 17.4504, lng: 78.3808, trafficLight: 'green', lightTimer: 9 },
      { id: 'n2', name: 'Jubilee Hills Checkpost', lat: 17.4347, lng: 78.4116, trafficLight: 'red', lightTimer: 6 },
      { id: 'n3', name: 'Charminar Plaza', lat: 17.3616, lng: 78.4747, trafficLight: 'green', lightTimer: 5 },
      { id: 'n4', name: 'Secunderabad Station', lat: 17.4344, lng: 78.5011, trafficLight: 'red', lightTimer: 8 },
      { id: 'n5', name: 'Begumpet Hub', lat: 17.4475, lng: 78.4682, trafficLight: 'green', lightTimer: 4 },
      { id: 'n6', name: 'Gachibowli Outer Ring Road', lat: 17.4401, lng: 78.3489, trafficLight: 'red', lightTimer: 10 },
      { id: 'n7', name: 'Panjagutta Circle', lat: 17.4264, lng: 78.4530, trafficLight: 'green', lightTimer: 7 },
      { id: 'n8', name: 'Koti Bus Terminus', lat: 17.3826, lng: 78.4839, trafficLight: 'red', lightTimer: 9 },
      { id: 'n9', name: 'Hussain Sagar Necklace Road', lat: 17.4140, lng: 78.4715, trafficLight: 'green', lightTimer: 6 }
    ],
    edges: JSON.parse(JSON.stringify(rawEdgesTemplate))
  },
  bangalore: {
    id: 'bangalore',
    name: 'Bangalore',
    country: 'India',
    center: [12.9716, 77.5946],
    nodes: [
      { id: 'n1', name: 'Majestic Bus Hub', lat: 12.9778, lng: 77.5719, trafficLight: 'green', lightTimer: 8 },
      { id: 'n2', name: 'Silk Board Junction', lat: 12.9176, lng: 77.6244, trafficLight: 'red', lightTimer: 12 },
      { id: 'n3', name: 'Indiranagar 100ft Road', lat: 12.9719, lng: 77.6394, trafficLight: 'green', lightTimer: 6 },
      { id: 'n4', name: 'Vidhana Soudha Palace', lat: 12.9796, lng: 77.5908, trafficLight: 'red', lightTimer: 7 },
      { id: 'n5', name: 'Hebbal Flyover', lat: 13.0358, lng: 77.5978, trafficLight: 'green', lightTimer: 5 },
      { id: 'n6', name: 'MG Road Metro Station', lat: 12.9754, lng: 77.6068, trafficLight: 'red', lightTimer: 8 },
      { id: 'n7', name: 'Electronic City Gate', lat: 12.8485, lng: 77.6601, trafficLight: 'green', lightTimer: 10 },
      { id: 'n8', name: 'Yeshwanthpur Junction', lat: 13.0236, lng: 77.5503, trafficLight: 'red', lightTimer: 9 },
      { id: 'n9', name: 'Koramangala Sony Signal', lat: 12.9351, lng: 77.6245, trafficLight: 'green', lightTimer: 7 }
    ],
    edges: JSON.parse(JSON.stringify(rawEdgesTemplate))
  },
  newyork: {
    id: 'newyork',
    name: 'New York',
    country: 'USA',
    center: [40.7500, -73.9850],
    nodes: [
      { id: 'n1', name: 'Times Square Broadway', lat: 40.7580, lng: -73.9855, trafficLight: 'green', lightTimer: 8 },
      { id: 'n2', name: 'Grand Central Terminal', lat: 40.7527, lng: -73.9772, trafficLight: 'red', lightTimer: 6 },
      { id: 'n3', name: 'Empire State Building', lat: 40.7484, lng: -73.9857, trafficLight: 'green', lightTimer: 5 },
      { id: 'n4', name: 'Wall Street Stock Exchange', lat: 40.7069, lng: -74.0112, trafficLight: 'red', lightTimer: 9 },
      { id: 'n5', name: 'Central Park South', lat: 40.7644, lng: -73.9730, trafficLight: 'green', lightTimer: 7 },
      { id: 'n6', name: 'Brooklyn Bridge Entry', lat: 40.7073, lng: -73.9982, trafficLight: 'red', lightTimer: 8 },
      { id: 'n7', name: 'Lincoln Tunnel Approach', lat: 40.7570, lng: -74.0016, trafficLight: 'green', lightTimer: 6 },
      { id: 'n8', name: 'Penn Station Terminal', lat: 40.7506, lng: -73.9935, trafficLight: 'red', lightTimer: 10 },
      { id: 'n9', name: 'Columbus Circle Plaza', lat: 40.7681, lng: -73.9819, trafficLight: 'green', lightTimer: 8 }
    ],
    edges: JSON.parse(JSON.stringify(rawEdgesTemplate))
  },
  london: {
    id: 'london',
    name: 'London',
    country: 'UK',
    center: [51.5074, -0.1278],
    nodes: [
      { id: 'n1', name: 'Piccadilly Circus Hub', lat: 51.5101, lng: -0.1349, trafficLight: 'green', lightTimer: 7 },
      { id: 'n2', name: 'Trafalgar Square', lat: 51.5080, lng: -0.1281, trafficLight: 'red', lightTimer: 5 },
      { id: 'n3', name: 'Westminster Big Ben', lat: 51.5007, lng: -0.1246, trafficLight: 'green', lightTimer: 6 },
      { id: 'n4', name: 'London Eye Plaza', lat: 51.5033, lng: -0.1195, trafficLight: 'red', lightTimer: 8 },
      { id: 'n5', name: 'Tower Bridge Access', lat: 51.5055, lng: -0.0754, trafficLight: 'green', lightTimer: 5 },
      { id: 'n6', name: 'King\'s Cross Station', lat: 51.5308, lng: -0.1238, trafficLight: 'red', lightTimer: 7 },
      { id: 'n7', name: 'Hyde Park Corner', lat: 51.5028, lng: -0.1527, trafficLight: 'green', lightTimer: 9 },
      { id: 'n8', name: 'Oxford Circus Crossing', lat: 51.5150, lng: -0.1419, trafficLight: 'red', lightTimer: 8 },
      { id: 'n9', name: 'London Bridge Crossing', lat: 51.5079, lng: -0.0877, trafficLight: 'green', lightTimer: 6 }
    ],
    edges: JSON.parse(JSON.stringify(rawEdgesTemplate))
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    center: [35.6762, 139.7503],
    nodes: [
      { id: 'n1', name: 'Shibuya Crossing', lat: 35.6595, lng: 139.7005, trafficLight: 'green', lightTimer: 9 },
      { id: 'n2', name: 'Shinjuku Station West', lat: 35.6896, lng: 139.6997, trafficLight: 'red', lightTimer: 7 },
      { id: 'n3', name: 'Tokyo Tower Plaza', lat: 35.6586, lng: 139.7454, trafficLight: 'green', lightTimer: 6 },
      { id: 'n4', name: 'Tokyo Station Central', lat: 35.6812, lng: 139.7671, trafficLight: 'red', lightTimer: 8 },
      { id: 'n5', name: 'Imperial Palace Outer', lat: 35.6852, lng: 139.7528, trafficLight: 'green', lightTimer: 5 },
      { id: 'n6', name: 'Roppongi Hills Crossing', lat: 35.6628, lng: 139.7291, trafficLight: 'red', lightTimer: 10 },
      { id: 'n7', name: 'Akihabara Electric Town', lat: 35.6997, lng: 139.7715, trafficLight: 'green', lightTimer: 7 },
      { id: 'n8', name: 'Ginza Cross Junction', lat: 35.6719, lng: 139.7649, trafficLight: 'red', lightTimer: 8 },
      { id: 'n9', name: 'Harajuku Takeshita Hub', lat: 35.6702, lng: 139.7027, trafficLight: 'green', lightTimer: 6 }
    ],
    edges: JSON.parse(JSON.stringify(rawEdgesTemplate))
  }
};

module.exports = sectors;
