# EBP Dashboard System Architecture

## System Overview

The EBP Dashboard is a comprehensive visualization system for tracking and displaying Earth BioGenome Project data. Below is the system architecture diagram:

```mermaid
graph TD
    A[EBP Dashboard System] --> B[Core Components]
    B --> C[index.html]
    B --> D[config.js]
    
    C --> E[Visualization Modules]
    D --> E
    
    E --> F[Assembly Progress]
    E --> G[Network Visualization]
    E --> H[Geographic Distribution]
    E --> I[Phylogenetic Analysis]
    
    F --> J[Progress Tracking]
    F --> K[Family/Species Level]
    F --> L[EBP Metrics]
    
    G --> M[WireMaps v1-v6]
    
    H --> N[Project Maps v1-v6]
    
    I --> O[PhyloTree]
    
    J --> P[Supporting Libraries]
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
    
    P --> Q[D3.js]
    P --> R[ECharts]
    P --> S[Font Awesome]
    P --> T[Underscore.js]
```

## Component Details

### Core Components
- **index.html**: Main entry point and dashboard interface
- **config.js**: Configuration and metadata management

### Visualization Modules
1. **Assembly Progress**
   - Progress tracking at taxonomic levels
   - Family and species level analysis
   - EBP metrics compliance tracking

2. **Network Visualization**
   - WireMaps showing EBP and affiliate networks
   - Multiple versions with iterative improvements

3. **Geographic Distribution**
   - Interactive project location maps
   - Enhanced visualization features

4. **Phylogenetic Analysis**
   - Taxonomic relationship trees
   - Order-level phylogenetic analysis

### Supporting Libraries
- D3.js: Core visualization engine
- ECharts: Advanced charting capabilities
- Font Awesome: Icon system
- Underscore.js: Utility functions

## Data Organization
- Source files in `pages/` directory
- Individual visualization HTML files
- Common utilities in `utils.js`
- Geographic data in `world.js`

## Architecture Features
- Modular design with self-contained visualization components
- Configuration-driven interface
- Modern web technologies
- Scalable visualization framework 