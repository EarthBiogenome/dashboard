/**
 * Configuration for EBP visualization pages
 * 
 * Each page object contains:
 * @property {string} name - Display name for the link
 * @property {string} file - Path to the HTML file
 * @property {string} description - Tooltip description
 * @property {string} category - Category for grouping related visualizations
 * @property {string} icon - Font Awesome icon class (optional)
 * @property {boolean} requiresBackend - Set on the two tool pages, which are not
 *   static: they read the `ebp-backend` API. Until Phase B provisions a hostname,
 *   `BACKEND_BASE_PRODUCTION` in `pages/services_backend.js` is empty and those
 *   pages can only say so, so `index.html` renders them as unavailable rather than
 *   as a link into a dead end. It decides that by asking `EBPBackend.backendBase()`
 *   — the one place that knows where the backend lives — so setting the hostname in
 *   that file is the ONLY edit needed to make these cards live. Do not duplicate the
 *   hostname here. (Task 8 / A-D5.)
 */

const copyright = {
  notice: "© 2026 THE EARTH BIOGENOME PROJECT",
  holder: "Fang Chen",
  year: "2026",
  rights: "All content and visualizations in this dashboard are protected by copyright law. Any unauthorized use, reproduction, or distribution is prohibited."
};

const pages = [
  {
    category: "Assembly Progress",
    pages: [
      {
        name: "Progress Over the Years", 
        file: "./pages/progress_Family_Species.html",
        description: "Annual assembly progress at the family and species level",
        icon: "fa-chart-line"
      },
      {
        name: "Progress at all Taxonomic Levels",
        file: "./pages/progress_all_taxa.html",
        description: "Animation display of assembly progress at main taxonomic ranks",
        icon: "fa-rainbow"
      },
      {
        name: "Progress by Phylum Groups",
        file: "./pages/progress_Phylum.html",
        description: "Number of eukaryotic species sequenced by EBP grouped by phylum",
        icon: "fa-chart-column"
      },
      {
        name: "Genome Assemblies Meeting EBP-standard Metrics",
        file: "./pages/progress_quality_metrics.html",
        description: "Contribution of EBP to assemblies meeting EBP-standard metrics at all taxonomic levels",
        icon: "fa-chart-bar"
      },
      {
        name: "Phylogenomic Display of Progress at Order Level",
        file: "./pages/phylotree.html",
        description: "Phylogenomic tree of orders with at least one species sequenced by EBP",
        icon: "fa-tree"
      },
      {
        name: "Affiliate & Regional Node Progress",
        file: "./pages/progress_affiliates_nodes.html",
        description: "Assembly progress across EBP affiliate projects and regional nodes",
        icon: "fa-chart-column"
      }
    ]
  },
  {
    category: "Network Visualization", 
    pages: [      
      {
        name: "Global Distribution",
        file: "./pages/distribution_map.html",
        description: "Geographic distribution of EBP affiliates",
        icon: "fa-globe"
      },
      {
        name: "Affiliate Network",
        file: "./pages/wiremaps.html",
        description: "Wired map showing EBP and affiliate network connections",
        icon: "fa-network-wired" 
      }
    ]
  },
  {
    /* The two tools, as against the report categories above: these take a
       question and a species list and answer it, rather than displaying a
       standing dataset. Both are served by `ebp-backend` and neither calls
       GoaT from the browser. */
    category: "Sequencing Coordination Toolset",
    pages: [
      {
        name: "Species Prioritization",
        file: "./pages/prioritization.html",
        description: "Is my species list worth sequencing? Each species labelled by phylogenetic novelty and by what the network is already doing",
        icon: "fa-bullseye",
        requiresBackend: true
      },
      {
        name: "Cross-project Duplication",
        file: "./pages/duplication_overview.html",
        description: "Is another project already sequencing these? Species one project shares with every other, by sequencing stage",
        icon: "fa-shuffle",
        requiresBackend: true
      }
    ]
  }
];