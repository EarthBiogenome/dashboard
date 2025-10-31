# GA4 Events Tracking Reference

## 📊 All Tracked Events Overview

### 🎯 User Interaction Events

| Event Name | Trigger | Category | Description |
|------------|---------|----------|-------------|
| `visualization_click` | User clicks on dashboard item | `dashboard_interaction` | Tracks which visualizations are accessed |
| `visualization_hover` | User hovers over dashboard item (500ms delay) | `user_engagement` | Measures user interest/engagement |
| `visualization_focus` | User focuses on dashboard item (keyboard navigation) | `accessibility` | Tracks accessibility usage |
| `category_view` | Category section loads on page | `dashboard_navigation` | Tracks which categories are viewed |

### 📈 Engagement Events

| Event Name | Trigger | Category | Description |
|------------|---------|----------|-------------|
| `scroll_depth` | User scrolls to 25%, 50%, 75%, 100% | `user_engagement` | Measures content engagement depth |
| `session_duration` | Page unload | `user_engagement` | Custom session timing in seconds |
| `dashboard_loaded` | All content loaded | `dashboard` | Tracks successful dashboard loads |
| `search_interaction` | User interacts with search/filter | `dashboard_interaction` | Search and filtering usage |

### 🗂️ Navigation Events

| Event Name | Trigger | Category | Description |
|------------|---------|----------|-------------|
| `menu_click` | Navigation menu interaction | `navigation` | Menu usage patterns |
| `external_link_click` | Click on external links | `outbound` | Tracks external resource access |
| `download_click` | File download initiation | `downloads` | Resource download tracking |

### 🔍 Content Events

| Event Name | Trigger | Category | Description |
|------------|---------|----------|-------------|
| `data_filter_applied` | Data filtering action | `data_interaction` | How users filter data |
| `visualization_shared` | Share button clicked | `sharing` | Content sharing behavior |
| `help_accessed` | Help/info button clicked | `support` | Help usage patterns |

## 🛠️ Event Parameters

### Standard Parameters (All Events)
```javascript
{
  event_category: 'category_name',
  event_label: 'specific_item_identifier',
  value: numeric_value (optional),
  custom_parameter: 'additional_context'
}
```

### 🎯 Specific Event Parameters

#### `visualization_click`
```javascript
gtag('event', 'visualization_click', {
  event_category: 'dashboard_interaction',
  visualization_type: 'phylogenetic_tree', // or 'map', 'chart', etc.
  visualization_id: 'tree_order_mixcolor',
  user_session_id: session_identifier,
  timestamp: Date.now()
});
```

#### `scroll_depth`
```javascript
gtag('event', 'scroll_depth', {
  event_category: 'user_engagement',
  scroll_percentage: 75, // 25, 50, 75, 100
  page_section: 'visualization_area',
  time_to_scroll: seconds_elapsed
});
```

#### `category_view`
```javascript
gtag('event', 'category_view', {
  event_category: 'dashboard_navigation', 
  category_name: 'species_progress',
  category_type: 'progress_metrics',
  load_time: milliseconds_to_load
});
```

#### `dashboard_loaded`
```javascript
gtag('event', 'dashboard_loaded', {
  event_category: 'dashboard',
  load_time: total_load_time_ms,
  visualizations_count: number_of_vis_loaded,
  data_points: total_data_points_loaded
});
```

## 📊 Implementation Examples

### Basic Event Tracking
```html
<script>
// Track visualization clicks
document.querySelectorAll('.visualization-item').forEach(item => {
  item.addEventListener('click', function() {
    gtag('event', 'visualization_click', {
      event_category: 'dashboard_interaction',
      event_label: this.id,
      visualization_type: this.dataset.type
    });
  });
});
</script>
```

### Advanced Engagement Tracking
```javascript
// Scroll depth tracking
let scrollDepthMarkers = [25, 50, 75, 100];
let scrollDepthTriggered = [];

window.addEventListener('scroll', function() {
  let scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  
  scrollDepthMarkers.forEach(marker => {
    if (scrollPercent >= marker && !scrollDepthTriggered.includes(marker)) {
      gtag('event', 'scroll_depth', {
        event_category: 'user_engagement',
        scroll_percentage: marker,
        time_to_scroll: Date.now() - pageStartTime
      });
      scrollDepthTriggered.push(marker);
    }
  });
});
```

### Session Duration Tracking
```javascript
// Track session duration on page unload
let sessionStart = Date.now();

window.addEventListener('beforeunload', function() {
  let sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
  
  gtag('event', 'session_duration', {
    event_category: 'user_engagement',
    session_length_seconds: sessionDuration,
    page_type: 'dashboard_main'
  });
});
```

## 🎯 Custom Dimensions Setup

Set up these custom dimensions in GA4 for enhanced analysis:

### User Scoped Dimensions
- `user_type`: First-time vs Returning
- `engagement_level`: High, Medium, Low (based on interactions)

### Event Scoped Dimensions  
- `visualization_type`: Type of visualization interacted with
- `interaction_depth`: Surface-level vs Deep engagement
- `session_quality`: Based on duration and interactions

### Item Scoped Dimensions
- `content_category`: Which dashboard section
- `data_complexity`: Simple vs Complex visualizations

## 🔧 Debugging Events

### Test Events in Real-time
1. **GA4 Realtime Reports**: See events as they fire
2. **Browser Console**: Check for gtag errors
3. **GA4 Debug View**: Enable debug mode for detailed event info

### Debug Mode Setup
```html
<script>
// Enable debug mode
gtag('config', 'G-N9WF546FSK', {
  debug_mode: true
});

// Log all events to console
gtag('event', 'page_view', {
  debug_mode: true,
  send_to: 'G-N9WF546FSK'
});
</script>
```

## 📈 Analytics Collection Integration

These events are automatically collected by the weekly analytics system:

### Collected Event Data
- **Event counts** by type and date
- **User engagement patterns** over time  
- **Content interaction trends** 
- **Geographic distribution** of events

### Analysis Features
- Weekly event summaries
- Cumulative interaction growth
- Engagement rate calculations
- Custom event trend analysis

---

**Implementation Status**: ✅ All events implemented in `index.html`
**Collection Status**: ✅ Weekly automated collection configured  
**Analysis Status**: ✅ Trend analysis and visualization ready
