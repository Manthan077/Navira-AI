# System Architecture

```mermaid
graph LR
    CityAdmin -->|Register Ambulance| AdminServer
    AdminServer -->|Issue Digital ID| Ambulance
    AdminServer -->|Verify Hospital| NaviraAI
    Ambulance -->|Position Updates| NaviraAI
    Hospital -->|Route Approval| NaviraAI
    Hospital -->|Live Tracking| NaviraAI
    Hospital -->|Create Emergency| NaviraAI
    NaviraAI -->|Route Calculation| MapEngine
    NaviraAI -->|Fastest Route| MapEngine
    NaviraAI -->|Activate Corridor| TrafficControl
    TrafficControl -->|Signal Control| TrafficSignals
```

## Components

- **CityAdmin**: Manages ambulance registration and fleet oversight
- **AdminServer**: Handles authentication and verification processes
- **Ambulance**: Real-time GPS tracking and emergency response
- **Hospital**: Emergency management and route coordination
- **NaviraAI**: Core system for route optimization and traffic control
- **MapEngine**: Route calculation and navigation services
- **TrafficControl**: Automated traffic signal management
- **TrafficSignals**: Physical traffic infrastructure integration