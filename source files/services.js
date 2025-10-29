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
      arr[index].value = d.data[0].value
      arr[index].description = `${sourceName}-${d.name}: ${d.data[0].description}`
      arr[index].label.show = true
      arr[index].label.rotate = 0
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
          let ratio = item.data[index].value / EBP[index].data[index].value
          if(EBP[index].data[index].value < 5) {
            EBP[index].data[index].value = EBP[index].data[index].value + 1
            ratio = Math.min(ratio, 3)
            item.data[index].value = EBP[index].data[index].value * ratio
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
    // totalBins: total number of bins (e.g., 2025-2002+1)
    const filled = new Array(totalBins).fill(0);
    for (let i = 0; i < rawData.length; i++) {
      filled[i] = rawData[i];
    }
    return filled;
  }

  // New function to fetch and aggregate raw species search data
  async function getSpeciesSearchData(searchUrl) {
    try {
      const startTime = performance.now();
      console.log('Fetching species search data from:', searchUrl);
      
      const fetchStartTime = performance.now();
      const response = await fetch(searchUrl);
      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        throw new Error(`Failed to fetch search data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const fetchEndTime = performance.now();
      console.log(`Species fetch time: ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`);
      
      console.log('Search data received, data structure:', Object.keys(data));
      console.log('Search data sample:', data);
      
      // Log the total count and structure
      if (data.results) {
        console.log('Total results:', data.results.length);
        if (data.results.length > 0) {
          console.log('First result structure:', Object.keys(data.results[0]));
          console.log('First result sample:', data.results[0]);
        }
      } else {
        console.log('No results field found in response');
      }
      
      // Aggregate data by year and assembly level
      const yearlyData = {};
      const assemblyLevels = ['contig', 'scaffold', 'chromosome', 'complete genome'];
      
      // Mapping from API response values to our internal format
      const assemblyLevelMapping = {
        'contig': 'contig',
        'scaffold': 'scaffold', 
        'chromosome': 'chromosome',
        'complete genome': 'complete genome'
      };
      
      // Initialize yearly data structure (species data starts from 2010)
      for (let year = 2010; year <= 2025; year++) {
        yearlyData[year] = {
          'contig': 0,
          'scaffold': 0,
          'chromosome': 0,
          'complete genome': 0
        };
      }
      
      // Process search results
      const processStartTime = performance.now();
      if (data.results && data.results.length > 0) {
        let processedCount = 0;
        data.results.forEach(item => {
          if (item.result && item.result.fields && 
              item.result.fields.assembly_date && item.result.fields.assembly_level) {
            
            const assemblyDateValue = item.result.fields.assembly_date.value;
            const assemblyLevelValue = item.result.fields.assembly_level.value;
            
            if (assemblyDateValue && assemblyLevelValue) {
              const assemblyDate = new Date(assemblyDateValue);
              const year = assemblyDate.getFullYear();
              const assemblyLevel = assemblyLevelValue.toLowerCase(); // Convert to lowercase to match our mapping
              
              if (year >= 2010 && year <= 2025 && assemblyLevels.includes(assemblyLevel)) {
                yearlyData[year][assemblyLevel]++;
                processedCount++;
              } else if (year >= 2010 && year <= 2025) {
                // Log unrecognized assembly levels to help with debugging
                console.log('Unrecognized assembly level:', assemblyLevelValue, 'for year', year);
              }
            }
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
      const category = Array.from({length: 2025 - 2010 + 1}, (_, i) => 2010 + i);
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
      console.log('Sample yearly data for 2025:', yearlyData[2025]);
      
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
      console.log('Fetching family search data from:', searchUrl);
      
      const fetchStartTime = performance.now();
      const response = await fetch(searchUrl);
      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        throw new Error(`Failed to fetch family search data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const fetchEndTime = performance.now();
      console.log(`Family fetch time: ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`);
      
      console.log('Family search data received, data structure:', Object.keys(data));
      console.log('Family search data sample:', data);
      
      // Log the total count and structure
      if (data.results) {
        console.log('Total family results:', data.results.length);
        if (data.results.length > 0) {
          console.log('First family result structure:', Object.keys(data.results[0]));
          console.log('First family result sample:', data.results[0]);
        }
      } else {
        console.log('No results field found in family response');
      }
      
      // Aggregate data by year and assembly level
      const yearlyData = {};
      const assemblyLevels = ['contig', 'scaffold', 'chromosome', 'complete genome'];
      
      // Initialize yearly data structure (families data starts from 2010)
      for (let year = 2010; year <= 2025; year++) {
        yearlyData[year] = {
          'contig': 0,
          'scaffold': 0,
          'chromosome': 0,
          'complete genome': 0
        };
      }
      
      // Process search results
      const processStartTime = performance.now();
      if (data.results && data.results.length > 0) {
        let processedCount = 0;
        data.results.forEach(item => {
          if (item.result && item.result.fields && 
              item.result.fields.assembly_date && item.result.fields.assembly_level) {
            
            const assemblyDateValue = item.result.fields.assembly_date.value;
            const assemblyLevelValue = item.result.fields.assembly_level.value;
            
            if (assemblyDateValue && assemblyLevelValue) {
              const assemblyDate = new Date(assemblyDateValue);
              const year = assemblyDate.getFullYear();
              const assemblyLevel = assemblyLevelValue.toLowerCase();
              
              if (year >= 2010 && year <= 2025 && assemblyLevels.includes(assemblyLevel)) {
                yearlyData[year][assemblyLevel]++;
                processedCount++;
              } else if (year >= 2010 && year <= 2025) {
                console.log('Unrecognized family assembly level:', assemblyLevelValue, 'for year', year);
              }
            }
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
      const category = Array.from({length: 2025 - 2010 + 1}, (_, i) => 2010 + i);
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
      console.log('Sample family yearly data for 2025:', yearlyData[2025]);
      
      const totalTime = performance.now() - startTime;
      console.log(`Total family processing time: ${totalTime.toFixed(2)}ms`);
      
      return result;
      
    } catch (error) {
      console.error('Error fetching family search data:', error);
      throw error;
    }
  }

  // Make the functions available globally
  window.getSpeciesSearchData = getSpeciesSearchData;
  window.getFamilySearchData = getFamilySearchData;
