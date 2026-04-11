/**
 * Configuration for EBP visualization pages
 * 
 * Each page object contains:
 * @property {string} name - Display name for the link
 * @property {string} file - Path to the HTML file
 * @property {string} description - Tooltip description
 * @property {string} category - Category for grouping related visualizations
 * @property {string} icon - Font Awesome icon class (optional)
 */

const copyright = {
  notice: "© 2025 THE EARTH BIOGENOME PROJECT",
  holder: "Fang Chen",
  year: "2025",
  rights: "All content and visualizations in this dashboard are protected by copyright law. Any unauthorized use, reproduction, or distribution is prohibited."
};

const pages = [
  {
    category: "Assembly Progress",
    pages: [
      {
        name: "Progress Over the Years", 
        file: "./source files/progress_Family_Species.html",
        description: "Annual assembly progress at the family and species level",
        icon: "fa-chart-line"
      },
      {
        name: "Progress at all Taxonomic Levels",
        file: "./source files/progress_StackedRainbow.html", 
        description: "Animation display of assembly progress at main taxonomic ranks",
        icon: "fa-rainbow"
      },
      {
        name: "Progress by Phylum Groups",
        file: "./source files/progress_Phylum_3panels.html",
        description: "Number of eukaryotic species sequenced by EBP grouped by phylum",
        icon: "fa-chart-column"
      },
      {
        name: "Genome Assemblies Meeting EBP-standard Metrics",
        file: "./source files/progress_EBPmetrics.html",
        description: "Contribution of EBP to assemblies meeting EBP-standard metrics at all taxonomic levels",
        icon: "fa-chart-bar"
      },
      {
        name: "Phylogenomic Display of Progress at Order Level",
        file: "./source files/PhyloTree_order.html",
        description: "Phylogenomic tree of orders with at least one species sequenced by EBP",
        icon: "fa-tree"
      },
      {
        name: "Affiliate & Regional Node Progress",
        file: "./source files/Affiliates_Node_Species_Progress.html",
        description: "Assembly progress across EBP affiliate projects and regional nodes",
        icon: "fa-chart-column"
      }
    ]
  },
  {
    category: "Network Visualization", 
    pages: [
      {
        name: "Affiliate Network",
        file: "./source files/WireMaps.html",
        description: "Wired map showing EBP and affiliate network connections",
        icon: "fa-network-wired" 
      },
      {
        name: "Global Distribution",
        file: "./source files/projectsMap.html",
        description: "Geographic distribution of EBP affiliates",
        icon: "fa-globe"
      }
    ]
  }
];