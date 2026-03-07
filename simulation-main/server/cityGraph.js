const https = require('https');

class CityGraph {
  constructor() {
    this.nodes = {}; // { id: { lat, lon, connected_roads: [] } }
    this.edges = []; // { id, nodes: [] }
    this.intersections = [];
    this.roadSegments = [];
  }

  async buildGraph() {
    return new Promise((resolve, reject) => {
      console.log('[CityGraph] Fetching OpenStreetMap roads for Chandigarh...');
      const query = `
        [out:json][timeout:25];
        (
          way["highway"~"primary|secondary"](30.69,76.73,30.77,76.83);
        );
        out body;
        >;
        out skel qt;
      `;
      const options = {
        hostname: 'overpass-api.de',
        path: '/api/interpreter',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            this.parseOSM(json.elements);
            resolve({ intersections: this.intersections, roadSegments: this.roadSegments });
          } catch (e) {
            console.error('[CityGraph] OSM Parse Error:', e);
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.write('data=' + encodeURIComponent(query));
      req.end();
    });
  }

  parseOSM(elements) {
    const tempNodes = {};
    const graph = {};

    elements.forEach(el => {
      if (el.type === 'node') {
        tempNodes[el.id] = { id: el.id, lat: el.lat, lon: el.lon };
        graph[el.id] = new Set();
      }
    });

    elements.forEach(el => {
      if (el.type === 'way' && el.nodes) {
        this.edges.push({ id: el.id, nodes: el.nodes });
        
        let coords = [];
        for (let idx of el.nodes) {
          if (tempNodes[idx]) coords.push({ lat: tempNodes[idx].lat, lng: tempNodes[idx].lon });
        }
        if (coords.length > 1) {
          this.roadSegments.push({ id: `way-${el.id}`, coords, name: el.tags?.name || 'Road' });
        }
        for (let i = 0; i < el.nodes.length; i++) {
          const u = el.nodes[i];
          if (!graph[u]) graph[u] = new Set();
          if (i > 0) {
            const v = el.nodes[i - 1];
            graph[u].add(v);
            if (!graph[v]) graph[v] = new Set();
            graph[v].add(u);
          }
          if (i < el.nodes.length - 1) {
            const v = el.nodes[i + 1];
            graph[u].add(v);
            if (!graph[v]) graph[v] = new Set();
            graph[v].add(u);
          }
        }
      }
    });

    let sigId = 1;
    for (const [nodeId, neighbors] of Object.entries(graph)) {
      if (neighbors.size >= 3) {
        const node = tempNodes[nodeId];
        if (node) {
          // Calculate bearings for connected roads to classify NS vs EW
          const roads = Array.from(neighbors).map(nId => {
            const neighbor = tempNodes[nId];
            return {
              id: nId,
              bearing: this.calculateBearing(node, neighbor)
            };
          });

          this.intersections.push({
            intersection_id: `SIG-${sigId++}`,
            latitude: node.lat,
            longitude: node.lon,
            connected_roads: neighbors.size,
            roads: roads, // Needed by SignalController to group NS/EW
            traffic_density: Math.floor(Math.random() * 70) + 10,
            current_phase: 1,
            signal_state: 'RED', // Will be managed by controller
            green_duration: 30
          });
        }
      }
    }
    console.log(`[CityGraph] Graph built. Detected ${this.intersections.length} valid >=3 way intersections.`);
  }

  calculateBearing(startNode, endNode) {
    const lat1 = startNode.lat * Math.PI / 180;
    const lon1 = startNode.lon * Math.PI / 180;
    const lat2 = endNode.lat * Math.PI / 180;
    const lon2 = endNode.lon * Math.PI / 180;

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // 0 to 360
  }
}

module.exports = new CityGraph();
