  // Will add consistent color mapping function at the top
  // Define consistent color mapping based on assembly level names
  function getAssemblyLevelColor(assemblyLevel) {
    const assemblyLevelColors = {
      'contig': '#ffff33',        // yellow
      'scaffold': '#22a884',     // teal
      'chromosome': '#404387',   // dark blue
      'complete genome': '#7ad151' // green
    };
    return assemblyLevelColors[assemblyLevel] || '#cccccc'; // fallback color
  }

// get请求
async function fetchData(url) {
    const response = await fetch(url); // 替换为你的 API URL
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json(); // 假设你的 API 返回的是 JSON 格式的数据
    return data;
  }

    // 获取表盘所需数据
    function getTreeData(url) {
      return new Promise((resolve) => {
        fetchData(url).then((res) => {
          resolve(res);
        });
      })
    }

  // 获取表盘所需数据
  function getUmberllaData(url) {
    return new Promise((resolve) => {
      fetchData(url).then((res) => {
        resolve(formatDataUmbrella(res));
      });
    })
  }

  // 将数据格式化成 echarts 需要的格式
  function formatDataUmbrella(data) {
    const arr = data.report.report.arc;
    const colors = ["#440154", "#404387", "#2a788e", "#22a884", "#7ad151", "#ff4500"];
    let index = 0
    return arr.map((item) => {
      return {
              name: item.rank,
              type: 'bar',
              data: [{
                value: Math.floor(item.arc * 1000 + 0.5) / 10,
                description: `${Number(item.x).toLocaleString('en-US')}/${Number(item.y).toLocaleString('en-US')}`
              }],
              total: item.y,
              num: item.x,
              coordinateSystem: 'polar',
              showBackground: true,
              backgroundStyle: {
                  color: '#cccccc'
              },
              itemStyle: {
                  color: colors[index++],
              },
              label: {
                  show: true,
                  position: 'middle',
                  formatter: `${Math.floor(item.arc * 1000 + 0.5) / 10}%`,
                  textStyle: {
                      color: '#fff',
                      fontSize: 10
                  }
              }
          }
    }).reverse();
  }

  function handleStackedFormat(data, colors, sourceName) {
    return data.map((d, index) => {
      if(colors) {
        d.itemStyle = {
          color: colors[index]
        }
      }
      const arr = [{
        value: 0,
        label: {
          show: false
        }
      },{
        value: 0,
        label: {
          show: false
        }
      },{
        value: 0,
        label: {
          show: false
        }
      },{
        value: 0,
        label: {
          show: false
        }
      },{
        value: 0,
        label: {
          show: false
        }
      },{
        value: 0,
        label: {
          show: false
        }
      }]
      // Invert index to place phylum inner (index 0) and species outer (index 5)
      const invertedIndex = 5 - index;
      arr[invertedIndex].value = d.data[0].value
      arr[invertedIndex].description = `${sourceName}-${d.name}: ${d.data[0].description}`
      arr[invertedIndex].label.show = true
      arr[invertedIndex].label.rotate = 0
      d.data = arr
      // d.stack = index
      d.stack  = 'a'

      return d
    })
  }
  
  function formatStackedUmbrellaData(url1, url2, delay = 1000) {
    return new Promise(resolve => {
      Promise.all([fetchData(url1), fetchData(url2)]).then((res) => {
        const EBPColors = ["#440154", "#404387", "#2a788e", "#22a884", "#7ad151", "#ff4500"];
        const INSDCColors = ["#6d3f9b", "#6e6d9b", "#55b4c6", "#4ad6a4", "#b3e093", "#ff8c42"]
        const EBPUmbrellaData = formatDataUmbrella(res[0])
        const INSDCUmbrellaData = formatDataUmbrella(res[1])
        const EBP = handleStackedFormat(EBPUmbrellaData, EBPColors.reverse(), 'EBP')
        const INSDC = handleStackedFormat(INSDCUmbrellaData, INSDCColors.reverse(), 'INSDC')
        // EBP.forEach(item => {
        //   item.animationDelay = function() {
        //     return 2 * delay
        //   }
        // })
        INSDC.forEach((item, index) => {
          // Use inverted index to match the inverted data positioning
          const invertedIndex = 5 - index;
          let ratio = item.data[invertedIndex].value / EBP[index].data[invertedIndex].value
          if(EBP[index].data[invertedIndex].value < 5) {
            EBP[index].data[invertedIndex].value = EBP[index].data[invertedIndex].value + 1
            ratio = Math.min(ratio, 3)
            item.data[invertedIndex].value = EBP[index].data[invertedIndex].value * ratio
          }
          // item.data[index].value = item.data[index].value - EBP[index].data[index].value
          // item.animationDelay = function() {
          //   return 1 * delay
          // }
        })
        const legends = []
        const len = EBPUmbrellaData.length
        for(let i = 0; i < len; i++) {
          legends.push({
            name: EBPUmbrellaData[i].name,
            color: EBPColors[i],
            data: [
              {name: 'EBP', num: EBPUmbrellaData[i].num, color: EBPColors[i]},
              {name: 'INSDC', num: INSDCUmbrellaData[i].num, color: INSDCColors[i]},
            ],
            contrast: EBPUmbrellaData[i].num / INSDCUmbrellaData[i].num,
            total: formatNumber(EBPUmbrellaData[i].total)
          })
        }

        const stackedData = EBP.map((_, index) => {
          return [
            EBP[index],
            INSDC[index]
          ]
        })
        resolve({
          stackedData: stackedData.flat(Infinity), legends
        })
      })
    })
    
  }

  // Format EBP quality metrics data into stacked arc chart format.
  // totalByRank: object keyed by rank name with total eukaryotic taxa count (denominator, same as StackedRainbow grey background).
  // ebpHits / insdcHits: objects keyed by rank name with quality-filtered counts.
  function formatQualityMetricsArcData(totalByRank, insdcHits, ebpHits) {
    // Same color arrays as formatStackedUmbrellaData — reversed before passing to handleStackedFormat
    const EBPColors   = ["#440154", "#404387", "#2a788e", "#22a884", "#7ad151", "#ff4500"];
    const INSDCColors = ["#6d3f9b", "#6e6d9b", "#55b4c6", "#4ad6a4", "#b3e093", "#ff8c42"];
    // ranks in same order as formatDataUmbrella output (phylum first, species last), then .reverse()
    const ranks = ["phylum", "class", "order", "family", "genus", "species"];

    const EBPUmbrellaData = ranks.map((rank) => {
      const total  = totalByRank[rank];
      const ebp    = ebpHits[rank];
      const arcPct = total > 0 ? Math.floor((ebp / total) * 1000 + 0.5) / 10 : 0;
      return {
        name: rank,
        type: 'bar',
        data: [{ value: arcPct, description: `${Number(ebp).toLocaleString('en-US')}/${Number(total).toLocaleString('en-US')}` }],
        total: total,
        num: ebp,
        coordinateSystem: 'polar',
        showBackground: true,
        backgroundStyle: { color: '#cccccc' },
        label: { show: true, position: 'middle', formatter: `${arcPct}%`, textStyle: { color: '#fff', fontSize: 10 } }
      };
    }).reverse();

    const INSDCUmbrellaData = ranks.map((rank) => {
      const total  = totalByRank[rank];
      const insdc  = insdcHits[rank];
      const arcPct = total > 0 ? Math.floor((insdc / total) * 1000 + 0.5) / 10 : 0;
      return {
        name: rank,
        type: 'bar',
        data: [{ value: arcPct, description: `${Number(insdc).toLocaleString('en-US')}/${Number(total).toLocaleString('en-US')}` }],
        total: total,
        num: insdc,
        coordinateSystem: 'polar',
        showBackground: true,
        backgroundStyle: { color: '#cccccc' },
        label: { show: true, position: 'middle', formatter: `${arcPct}%`, textStyle: { color: '#fff', fontSize: 10 } }
      };
    }).reverse();

    // Mirror formatStackedUmbrellaData exactly: reverse color arrays before passing to handleStackedFormat
    const EBP   = handleStackedFormat(EBPUmbrellaData,   EBPColors.reverse(),   'EBP-quality');
    const INSDC = handleStackedFormat(INSDCUmbrellaData, INSDCColors.reverse(), 'INSDC-quality');

    // Subtract EBP arc from INSDC arc so they stack correctly (same logic as formatStackedUmbrellaData)
    INSDC.forEach((item, index) => {
      const invertedIndex = 5 - index;
      let ratio = item.data[invertedIndex].value / EBP[index].data[invertedIndex].value;
      if (EBP[index].data[invertedIndex].value < 5) {
        EBP[index].data[invertedIndex].value = EBP[index].data[invertedIndex].value + 1;
        ratio = Math.min(ratio, 3);
        item.data[invertedIndex].value = EBP[index].data[invertedIndex].value * ratio;
      }
    });

    // After .reverse() above, EBPColors/INSDCColors are now in reversed order — same as formatStackedUmbrellaData
    const legends = [];
    const len = EBPUmbrellaData.length;
    for (let i = 0; i < len; i++) {
      legends.push({
        name: EBPUmbrellaData[i].name,
        color: EBPColors[i],
        data: [
          { name: 'EBP-quality',   num: EBPUmbrellaData[i].num,   color: EBPColors[i]   },
          { name: 'INSDC-quality', num: INSDCUmbrellaData[i].num, color: INSDCColors[i] }
        ],
        contrast: INSDCUmbrellaData[i].num > 0 ? EBPUmbrellaData[i].num / INSDCUmbrellaData[i].num : 0,
        total: formatNumber(EBPUmbrellaData[i].total)
      });
    }

    const stackedData = EBP.map((_, index) => [EBP[index], INSDC[index]]).flat();
    return { stackedData, legends };
  }

  // 获取柱状图所需数据
  function getStackedBarData(url) {
      return new Promise(resolve => {
          fetchData(url).then((res) => {
              resolve({
                formatData: formatStackedBarData(res), 
                defaultData: getDefaultStackedBarData(res),
                percentData: getPercentStackedBarData(res)
              })
          });
      })
    
  }

  function generateBinLabels(buckets) {
    const years = buckets.map(d => new Date(d).getFullYear());
    const labels = [];
    for (let i = 0; i < years.length; i++) {
      if (i < years.length - 1) {
        labels.push(`${years[i]}-${years[i + 1] - 1}`);
      } else {
        labels.push(`${years[i]}`);
      }
    }
    return labels;
  }

  // 将数据格式化成 echarts 需要的格式
  function formatStackedBarData(data) {
    const histograms = data.report.report.histogram.histograms;
    console.log('Raw data buckets:', histograms.buckets);
    console.log('Raw data byCat:', histograms.byCat);
    
    const tableName = data.report.report.yLabel+ ' ' + '(cumulative)'
    // Generate two-year bin labels
    const category = generateBinLabels(histograms.buckets);
    console.log('Processed categories:', category);
    
    const series = [];
    for (let name in histograms.byCat) {
      const rawData = histograms.byCat[name];
      console.log(`Raw data for ${name}:`, rawData);
      
      const totalBins = category.length; // category is the array of bin labels
      const filledData = fillMissingBins(rawData, totalBins);
      
      const obj = {
        name,
        type: "bar",
        stack: "total",
        label: {
          show: false,
        },
        itemStyle: {
            color: getAssemblyLevelColor(name), // Use consistent color mapping
          },
          barGap: '1px',
          barCategoryGap: '1px',
      };
      
      // Calculate cumulative sums properly
      obj.data = filledData.reduce((acc, curr, idx) => {
        if (idx === 0) return [curr];
        return [...acc, acc[idx - 1] + curr];
      }, []);
      
      console.log(`Cumulative data for ${name}:`, obj.data);
      
      const total = obj.data[obj.data.length - 1]
      obj.description = formatNumber(total)
      series.push(obj);
    }

    return {
      category,
      series,
      tableName
    }
  }

  function getDefaultStackedBarData(data) {
    const histograms = data.report.report.histogram.histograms;
    const tableName = data.report.report.yLabel + ' ' + '(actual)'
    // Generate two-year bin labels
    const category = generateBinLabels(histograms.buckets);
    const series = [];
    for (let name in histograms.byCat) {
      const rawData = histograms.byCat[name];
      const totalBins = category.length; // category is the array of bin labels
      const filledData = fillMissingBins(rawData, totalBins);
      const obj = {
        name,
        type: "bar",
        stack: "total",
        label: {
          show: false,
        },
        itemStyle: {
            color: getAssemblyLevelColor(name), // Use consistent color mapping
          },
          barGap: '1px', // 同一类目下系列之间的间隔
          barCategoryGap: '1px',
      };
      obj.data = filledData;
      const total = calculateCumulativeSums(filledData)[obj.data.length - 1]
      obj.description = formatNumber(total)
      series.push(obj);
    }

    return {
      category,
      series,
      tableName
    }
  }

  function getPercentStackedBarData(data) {
    const histograms = data.report.report.histogram.histograms;
    const tableName = data.report.report.yLabel + ' ' + '(YoY growth)'
    // Generate two-year bin labels
    const category = generateBinLabels(histograms.buckets);
    const series = [];
    for (let name in histograms.byCat) {
      const rawData = histograms.byCat[name];
      const totalBins = category.length; // category is the array of bin labels
      const filledData = fillMissingBins(rawData, totalBins);
      const obj = {
        name,
        type: "bar",
        stack: "total",
        label: {
          show: false,
        },
        itemStyle: {
            color: getAssemblyLevelColor(name), // Use consistent color mapping
          },
          barGap: '1px', // 同一类目下系列之间的间隔
          barCategoryGap: '1px',
      };
      obj.data = filledData.map((item, index) => {
        if(index === 0) return item > 0 ? 100 : 0
        const lastVal = filledData[index - 1]
        if(lastVal === 0) return item > 0 ? 100 : 0

        return ((item - lastVal) / lastVal * 100).toFixed(2)
      });
      const total = 0
      obj.description = formatNumber(total)
      series.push(obj);
    }

    return {
      category,
      series,
      tableName
    }
  }

  function fillMissingBins(rawData, totalBins) {
    // rawData: array of counts per bin (may be shorter than totalBins)
    // totalBins: total number of bins (e.g., 2026-2010+1)
    const filled = new Array(totalBins).fill(0);
    for (let i = 0; i < rawData.length; i++) {
      filled[i] = rawData[i];
    }
    return filled;
  }

  /**
   * Fetches all results from a paginated API endpoint.
   * Automatically handles pagination to retrieve all records.
   */
  async function fetchAllPaginatedResults(baseUrl, pageSize = 10000) {
    const allResults = [];
    let offset = 0;
    let totalCount = null;
    let maxPages = 10; // Safety limit to prevent infinite loops
    let pageCount = 0;
    
    // Determine the separator for adding params
    const hasQuery = baseUrl.includes('?');
    const separator = hasQuery ? '&' : '?';
    
    console.log(`Starting paginated fetch with pageSize=${pageSize}`);
    console.log(`Base URL: ${baseUrl}`);
    
    while (pageCount < maxPages) {
      pageCount++;
      
      // Build URL with current pagination params
      const fetchUrl = baseUrl + separator + 'size=' + pageSize + '&offset=' + offset;
      
      console.log('Fetching page ' + pageCount + ': offset=' + offset + ', size=' + pageSize);
      console.log('Fetch URL: ' + fetchUrl);
      
      try {
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
          console.error('HTTP error: ' + response.status + ' ' + response.statusText);
          throw new Error('HTTP error: ' + response.status + ' ' + response.statusText);
        }
        
        const data = await response.json();
        console.log('API response received, keys:', Object.keys(data));
        
        // Get total count from first response (GoaT API uses status.hits)
        if (totalCount === null && data.status && data.status.hits !== undefined) {
          totalCount = data.status.hits;
          console.log('Total records available: ' + totalCount);
        }
        
        // Add results from this page
        if (data.results && data.results.length > 0) {
          allResults.push.apply(allResults, data.results);
          console.log('Fetched ' + data.results.length + ' records, total so far: ' + allResults.length);
          
          // Check if we've fetched all records
          if (data.results.length < pageSize) {
            console.log('Pagination complete (last page). Total fetched: ' + allResults.length);
            break;
          }
          
          if (totalCount !== null && allResults.length >= totalCount) {
            console.log('Pagination complete (reached total). Total fetched: ' + allResults.length);
            break;
          }
          
          offset += pageSize;
        } else {
          console.log('No more results, pagination complete');
          break;
        }
      } catch (error) {
        console.error('Error fetching page ' + pageCount + ':', error);
        // If we have some results, return them instead of failing completely
        if (allResults.length > 0) {
          console.warn('Returning partial results (' + allResults.length + ' records) due to error');
          return allResults;
        }
        throw error;
      }
    }
    
    if (pageCount >= maxPages) {
      console.warn('Reached maximum page limit (' + maxPages + '). Total fetched: ' + allResults.length);
    }
    
    return allResults;
  }

  // New function to fetch and aggregate raw species search data
  async function getSpeciesSearchData(searchUrl) {
    try {
      const startTime = performance.now();
      console.log('Fetching species search data with pagination...');
      
      const fetchStartTime = performance.now();
      // Use paginated fetch to get all results
      const allResults = await fetchAllPaginatedResults(searchUrl);
      const fetchEndTime = performance.now();
      console.log(`Species fetch time: ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`);
      
      console.log('Total species results fetched:', allResults.length);
      
      // Aggregate data by year and assembly level
      const yearlyData = {};
      const assemblyLevels = ['contig', 'scaffold', 'chromosome', 'complete genome'];
      
      // Initialize yearly data structure (species data starts from 2010)
      for (let year = 2010; year <= 2026; year++) {
        yearlyData[year] = {
          'contig': 0,
          'scaffold': 0,
          'chromosome': 0,
          'complete genome': 0
        };
      }
      
      // Process search results
      const processStartTime = performance.now();
      if (allResults.length > 0) {
        let processedCount = 0;
        allResults.forEach(item => {
          if (item.result && item.result.fields) {
            // Get assembly date, default to current year if missing
            let year = 2026;
            if (item.result.fields.assembly_date && item.result.fields.assembly_date.value) {
              const assemblyDate = new Date(item.result.fields.assembly_date.value);
              year = assemblyDate.getFullYear();
              // Clamp year to valid range
              if (year < 2010) year = 2010;
              if (year > 2026) year = 2026;
            }
            
            // Get assembly level, default to 'scaffold' if missing or unrecognized
            let assemblyLevel = 'scaffold';
            if (item.result.fields.assembly_level && item.result.fields.assembly_level.value) {
              const levelValue = item.result.fields.assembly_level.value.toLowerCase();
              if (assemblyLevels.includes(levelValue)) {
                assemblyLevel = levelValue;
              } else {
                console.log('Unrecognized assembly level:', item.result.fields.assembly_level.value, '- defaulting to scaffold');
              }
            }
            
            yearlyData[year][assemblyLevel]++;
            processedCount++;
          }
        });
        console.log('Processed', processedCount, 'records from search results');
        const processEndTime = performance.now();
        console.log(`Species processing time: ${(processEndTime - processStartTime).toFixed(2)}ms`);
      } else {
        console.log('No results found in search data');
      }
      
      // Convert to the format expected by the chart
      const chartStartTime = performance.now();
      const category = Array.from({length: 2026 - 2010 + 1}, (_, i) => 2010 + i);
      const series = [];
      
      assemblyLevels.forEach(level => {
        const yearlyValues = category.map(year => yearlyData[year][level]);
        
        // For actual data
        const actualSeries = {
          name: level,
          type: "bar",
          stack: "total",
          label: {
            show: false,
          },
          itemStyle: {
            color: getAssemblyLevelColor(level),
          },
          barGap: '1px',
          barCategoryGap: '1px',
          data: yearlyValues
        };
        
        const total = yearlyValues.reduce((sum, val) => sum + val, 0);
        actualSeries.description = formatNumber(total);
        series.push(actualSeries);
      });
      
      // Calculate YoY growth data
      const percentSeries = [];
      assemblyLevels.forEach(level => {
        const yearlyValues = category.map(year => yearlyData[year][level]);
        const growthData = yearlyValues.map((item, index) => {
          if (index === 0) return item > 0 ? 100 : 0;
          const lastVal = yearlyValues[index - 1];
          if (lastVal === 0) return item > 0 ? 100 : 0;
          return ((item - lastVal) / lastVal * 100).toFixed(2);
        });
        
        const percentSeriesItem = {
          name: level,
          type: "bar",
          stack: "total",
          label: {
            show: false,
          },
          itemStyle: {
            color: getAssemblyLevelColor(level),
          },
          barGap: '1px',
          barCategoryGap: '1px',
          data: growthData
        };
        
        percentSeriesItem.description = formatNumber(0);
        percentSeries.push(percentSeriesItem);
      });
      
      const chartEndTime = performance.now();
      console.log(`Species chart preparation time: ${(chartEndTime - chartStartTime).toFixed(2)}ms`);
      
      const result = {
        defaultData: {
          category,
          series,
          tableName: 'Count of Species (Actual)'
        },
        percentData: {
          category,
          series: percentSeries,
          tableName: 'Count of Species (YoY Growth)'
        }
      };
      
      console.log('Final aggregated result:', result);
      console.log('Sample yearly data for 2026:', yearlyData[2026]);
      
      const totalTime = performance.now() - startTime;
      console.log(`Total species processing time: ${totalTime.toFixed(2)}ms`);
      
      return result;
      
    } catch (error) {
      console.error('Error fetching species search data:', error);
      throw error;
    }
  }

  // Helper function to format numbers (if not already defined)
  function formatNumber(num) {
    if (typeof num !== 'number') return num;
    return num.toLocaleString();
  }

  // New function to fetch and aggregate raw family search data
  async function getFamilySearchData(searchUrl) {
    try {
      const startTime = performance.now();
      console.log('Fetching family search data with pagination...');
      
      const fetchStartTime = performance.now();
      // Use paginated fetch to get all results
      const allResults = await fetchAllPaginatedResults(searchUrl);
      const fetchEndTime = performance.now();
      console.log(`Family fetch time: ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`);
      
      console.log('Total family results fetched:', allResults.length);
      
      // Aggregate data by year and assembly level
      const yearlyData = {};
      const assemblyLevels = ['contig', 'scaffold', 'chromosome', 'complete genome'];
      
      // Initialize yearly data structure (families data starts from 2010)
      for (let year = 2010; year <= 2026; year++) {
        yearlyData[year] = {
          'contig': 0,
          'scaffold': 0,
          'chromosome': 0,
          'complete genome': 0
        };
      }
      
      // Process search results
      const processStartTime = performance.now();
      if (allResults.length > 0) {
        let processedCount = 0;
        allResults.forEach(item => {
          if (item.result && item.result.fields) {
            // Get assembly date, default to current year if missing
            let year = 2026;
            if (item.result.fields.assembly_date && item.result.fields.assembly_date.value) {
              const assemblyDate = new Date(item.result.fields.assembly_date.value);
              year = assemblyDate.getFullYear();
              // Clamp year to valid range
              if (year < 2010) year = 2010;
              if (year > 2026) year = 2026;
            }
            
            // Get assembly level, default to 'scaffold' if missing or unrecognized
            let assemblyLevel = 'scaffold';
            if (item.result.fields.assembly_level && item.result.fields.assembly_level.value) {
              const levelValue = item.result.fields.assembly_level.value.toLowerCase();
              if (assemblyLevels.includes(levelValue)) {
                assemblyLevel = levelValue;
              } else {
                console.log('Unrecognized family assembly level:', item.result.fields.assembly_level.value, '- defaulting to scaffold');
              }
            }
            
            yearlyData[year][assemblyLevel]++;
            processedCount++;
          }
        });
        console.log('Processed', processedCount, 'family records from search results');
        const processEndTime = performance.now();
        console.log(`Family processing time: ${(processEndTime - processStartTime).toFixed(2)}ms`);
      } else {
        console.log('No results found in family search data');
      }
      
      // Convert to the format expected by the chart
      const chartStartTime = performance.now();
      const category = Array.from({length: 2026 - 2010 + 1}, (_, i) => 2010 + i);
      const series = [];
      
      assemblyLevels.forEach(level => {
        const yearlyValues = category.map(year => yearlyData[year][level]);
        
        // For actual data
        const actualSeries = {
          name: level,
          type: "bar",
          stack: "total",
          label: {
            show: false,
          },
          itemStyle: {
            color: getAssemblyLevelColor(level),
          },
          barGap: '1px',
          barCategoryGap: '1px',
          data: yearlyValues
        };
        
        const total = yearlyValues.reduce((sum, val) => sum + val, 0);
        actualSeries.description = formatNumber(total);
        series.push(actualSeries);
      });
      
      // Calculate YoY growth data
      const percentSeries = [];
      assemblyLevels.forEach(level => {
        const yearlyValues = category.map(year => yearlyData[year][level]);
        const growthData = yearlyValues.map((item, index) => {
          if (index === 0) return item > 0 ? 100 : 0;
          const lastVal = yearlyValues[index - 1];
          if (lastVal === 0) return item > 0 ? 100 : 0;
          return ((item - lastVal) / lastVal * 100).toFixed(2);
        });
        
        const percentSeriesItem = {
          name: level,
          type: "bar",
          stack: "total",
          label: {
            show: false,
          },
          itemStyle: {
            color: getAssemblyLevelColor(level),
          },
          barGap: '1px',
          barCategoryGap: '1px',
          data: growthData
        };
        
        percentSeriesItem.description = formatNumber(0);
        percentSeries.push(percentSeriesItem);
      });
      
      const chartEndTime = performance.now();
      console.log(`Family chart preparation time: ${(chartEndTime - chartStartTime).toFixed(2)}ms`);
      
      const result = {
        defaultData: {
          category,
          series,
          tableName: 'Count of Families (Actual)'
        },
        percentData: {
          category,
          series: percentSeries,
          tableName: 'Count of Families (YoY Growth)'
        }
      };
      
      console.log('Final family aggregated result:', result);
      console.log('Sample family yearly data for 2026:', yearlyData[2026]);
      
      const totalTime = performance.now() - startTime;
      console.log(`Total family processing time: ${totalTime.toFixed(2)}ms`);
      
      return result;
      
    } catch (error) {
      console.error('Error fetching family search data:', error);
      throw error;
    }
  }

  /**
   * Fetches species data using the Report API (histogram endpoint).
   * This ensures data matches GoaT exactly without manual aggregation.
   */
  async function getSpeciesReportData(reportUrl) {
    try {
      console.log('Fetching species data from Report API...');
      const data = await fetchData(reportUrl);
      return processReportData(data, 'Species');
    } catch (error) {
      console.error('Error fetching species report data:', error);
      throw error;
    }
  }

  /**
   * Fetches family data using the Report API (histogram endpoint).
   * This ensures data matches GoaT exactly without manual aggregation.
   */
  async function getFamilyReportData(reportUrl) {
    try {
      console.log('Fetching family data from Report API...');
      const data = await fetchData(reportUrl);
      return processReportData(data, 'Family');
    } catch (error) {
      console.error('Error fetching family report data:', error);
      throw error;
    }
  }

  /**
   * Processes Report API response into chart-ready format.
   * Handles actual counts and YoY growth calculations.
   */
  function processReportData(data, dataType) {
    const histograms = data.report.report.histogram.histograms;
    const assemblyLevels = ['contig', 'scaffold', 'chromosome', 'complete genome'];
    
    // Extract years from buckets (use UTC to avoid timezone shifting Jan 1 dates to prior year)
    const category = histograms.buckets.map(d => new Date(d).getUTCFullYear());
    console.log(`${dataType} Report API - Years:`, category);
    console.log(`${dataType} Report API - byCat:`, histograms.byCat);
    
    // Build actual (non-cumulative) series
    const series = [];
    assemblyLevels.forEach(level => {
      const rawData = histograms.byCat[level] || [];
      const filledData = fillMissingBins(rawData, category.length);
      
      const actualSeries = {
        name: level,
        type: "bar",
        stack: "total",
        label: { show: false },
        itemStyle: { color: getAssemblyLevelColor(level) },
        barGap: '1px',
        barCategoryGap: '1px',
        data: filledData
      };
      
      const total = filledData.reduce((sum, val) => sum + val, 0);
      actualSeries.description = formatNumber(total);
      series.push(actualSeries);
    });
    
    // Build YoY growth series
    const percentSeries = [];
    assemblyLevels.forEach(level => {
      const rawData = histograms.byCat[level] || [];
      const filledData = fillMissingBins(rawData, category.length);
      
      const growthData = filledData.map((item, index) => {
        if (index === 0) return item > 0 ? 100 : 0;
        const lastVal = filledData[index - 1];
        if (lastVal === 0) return item > 0 ? 100 : 0;
        return ((item - lastVal) / lastVal * 100).toFixed(2);
      });
      
      const percentSeriesItem = {
        name: level,
        type: "bar",
        stack: "total",
        label: { show: false },
        itemStyle: { color: getAssemblyLevelColor(level) },
        barGap: '1px',
        barCategoryGap: '1px',
        data: growthData
      };
      
      percentSeriesItem.description = formatNumber(0);
      percentSeries.push(percentSeriesItem);
    });
    
    const result = {
      defaultData: {
        category,
        series,
        tableName: `Count of ${dataType} (Actual)`
      },
      percentData: {
        category,
        series: percentSeries,
        tableName: `Count of ${dataType} (YoY Growth)`
      }
    };
    
    console.log(`${dataType} Report API - Processed result:`, result);
    return result;
  }

  // Make the functions available globally
  window.getSpeciesSearchData = getSpeciesSearchData;
  window.getFamilySearchData = getFamilySearchData;
  window.getSpeciesReportData = getSpeciesReportData;
  window.getFamilyReportData = getFamilyReportData;