const https = require('https');

async function fetchOSMIntersections() {
  return new Promise((resolve, reject) => {
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
          resolve(json.elements);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write('data=' + encodeURIComponent(query));
    req.end();
  });
}

function detectIntersections(elements) {
  const nodes = {};
  const graph = {};
  
  elements.forEach(el => {
    if (el.type === 'node') {
      nodes[el.id] = { lat: el.lat, lon: el.lon };
      graph[el.id] = new Set();
    }
  });
  
  elements.forEach(el => {
    if (el.type === 'way' && el.nodes) {
      for (let i = 0; i < el.nodes.length; i++) {
        const u = el.nodes[i];
        if (!graph[u]) graph[u] = new Set();
        
        if (i > 0) {
          const v = el.nodes[i-1];
          graph[u].add(v);
          if (!graph[v]) graph[v] = new Set();
          graph[v].add(u);
        }
        if (i < el.nodes.length - 1) {
          const v = el.nodes[i+1];
          graph[u].add(v);
          if (!graph[v]) graph[v] = new Set();
          graph[v].add(u);
        }
      }
    }
  });

  const intersections = [];
  for (const [nodeId, neighbors] of Object.entries(graph)) {
    if (neighbors.size >= 3) {
      const node = nodes[nodeId];
      if (node) intersections.push(node);
    }
  }
  return intersections;
}

async function main() {
  console.log("Fetching...");
  const elements = await fetchOSMIntersections();
  console.log(`Fetched ${elements.length} elements`);
  const ints = detectIntersections(elements);
  console.log(`Detected ${ints.length} intersections`);
}

main();
