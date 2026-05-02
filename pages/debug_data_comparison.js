/**
 * Data Comparison Utility for EBP Network Files
 * This script helps identify differences between two EBP network data files
 * 
 * Usage:
 * 1. Include this script in your HTML after loading both data files
 * 2. Call compareDataFiles(data1, data2) to get a detailed comparison
 */

function compareDataFiles(data1, data2, fileName1 = 'File 1', fileName2 = 'File 2') {
    console.group(`🔍 Comparing ${fileName1} vs ${fileName2}`);
    
    const results = {
        summary: {},
        differences: [],
        issues: []
    };
    
    // Basic validation
    if (!Array.isArray(data1) || !Array.isArray(data2)) {
        results.issues.push('One or both data sources are not arrays');
        console.error('❌ Data validation failed: Not arrays');
        return results;
    }
    
    // Summary comparison
    results.summary = {
        [fileName1]: {
            totalRecords: data1.length,
            types: getTypeCounts(data1),
            fieldStructure: data1.length > 0 ? Object.keys(data1[0]) : []
        },
        [fileName2]: {
            totalRecords: data2.length,
            types: getTypeCounts(data2),
            fieldStructure: data2.length > 0 ? Object.keys(data2[0]) : []
        }
    };
    
    console.log('📊 Summary:', results.summary);
    
    // Field structure comparison
    const fields1 = new Set(results.summary[fileName1].fieldStructure);
    const fields2 = new Set(results.summary[fileName2].fieldStructure);
    
    const missingInFile1 = [...fields2].filter(field => !fields1.has(field));
    const missingInFile2 = [...fields1].filter(field => !fields2.has(field));
    
    if (missingInFile1.length > 0) {
        results.differences.push(`Fields missing in ${fileName1}: ${missingInFile1.join(', ')}`);
    }
    if (missingInFile2.length > 0) {
        results.differences.push(`Fields missing in ${fileName2}: ${missingInFile2.join(', ')}`);
    }
    
    // Data validation checks
    validateDataStructure(data1, fileName1, results);
    validateDataStructure(data2, fileName2, results);
    
    // Project comparison
    const projects1 = new Map(data1.map(item => [item.projectName?.toLowerCase(), item]));
    const projects2 = new Map(data2.map(item => [item.projectName?.toLowerCase(), item]));
    
    const onlyInFile1 = [...projects1.keys()].filter(name => !projects2.has(name));
    const onlyInFile2 = [...projects2.keys()].filter(name => !projects1.has(name));
    
    if (onlyInFile1.length > 0) {
        results.differences.push(`Projects only in ${fileName1}: ${onlyInFile1.slice(0, 5).join(', ')}${onlyInFile1.length > 5 ? '...' : ''}`);
    }
    if (onlyInFile2.length > 0) {
        results.differences.push(`Projects only in ${fileName2}: ${onlyInFile2.slice(0, 5).join(', ')}${onlyInFile2.length > 5 ? '...' : ''}`);
    }
    
    // Check for data quality issues
    const issues1 = findDataIssues(data1, fileName1);
    const issues2 = findDataIssues(data2, fileName2);
    
    results.issues.push(...issues1, ...issues2);
    
    // Log results
    if (results.differences.length > 0) {
        console.warn('⚠️ Differences found:');
        results.differences.forEach(diff => console.warn('  -', diff));
    }
    
    if (results.issues.length > 0) {
        console.error('❌ Data issues found:');
        results.issues.forEach(issue => console.error('  -', issue));
    }
    
    if (results.differences.length === 0 && results.issues.length === 0) {
        console.log('✅ No significant differences or issues found');
    }
    
    console.groupEnd();
    return results;
}

function getTypeCounts(data) {
    const counts = {};
    data.forEach(item => {
        const type = item.type || 'Unknown';
        counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
}

function validateDataStructure(data, fileName, results) {
    const requiredFields = ['projectName', 'type', 'latitude', 'longitude'];
    
    data.forEach((item, index) => {
        // Check required fields
        const missingFields = requiredFields.filter(field => !(field in item) || item[field] === null || item[field] === undefined);
        if (missingFields.length > 0) {
            results.issues.push(`${fileName} record ${index}: Missing fields: ${missingFields.join(', ')}`);
        }
        
        // Check coordinate validity
        if (typeof item.latitude !== 'number' || isNaN(item.latitude) || item.latitude < -90 || item.latitude > 90) {
            results.issues.push(`${fileName} record ${index}: Invalid latitude: ${item.latitude}`);
        }
        if (typeof item.longitude !== 'number' || isNaN(item.longitude) || item.longitude < -180 || item.longitude > 180) {
            results.issues.push(`${fileName} record ${index}: Invalid longitude: ${item.longitude}`);
        }
        
        // Check type validity
        const validTypes = ['Headquarters', 'Site', 'Center'];
        if (!validTypes.includes(item.type)) {
            results.issues.push(`${fileName} record ${index}: Invalid type: ${item.type}`);
        }
        
        // Check for empty project name
        if (!item.projectName || item.projectName.trim() === '') {
            results.issues.push(`${fileName} record ${index}: Empty project name`);
        }
    });
}

function findDataIssues(data, fileName) {
    const issues = [];
    
    // Check for duplicate project names
    const projectNames = {};
    data.forEach((item, index) => {
        const name = item.projectName?.toLowerCase();
        if (name) {
            if (projectNames[name]) {
                issues.push(`${fileName}: Duplicate project name "${item.projectName}" at indices ${projectNames[name]} and ${index}`);
            } else {
                projectNames[name] = index;
            }
        }
    });
    
    // Check for suspicious coordinates (all zeros, or clearly invalid)
    const suspiciousCoords = data.filter(item => 
        (item.latitude === 0 && item.longitude === 0) ||
        Math.abs(item.latitude) > 90 ||
        Math.abs(item.longitude) > 180
    );
    
    if (suspiciousCoords.length > 0) {
        issues.push(`${fileName}: ${suspiciousCoords.length} records with suspicious coordinates`);
    }
    
    return issues;
}

// Auto-run comparison if both files are loaded
document.addEventListener('DOMContentLoaded', function() {
    // Try to compare with common data variable names
    if (typeof projectsData !== 'undefined' && typeof projectsDataOld !== 'undefined') {
        compareDataFiles(projectsDataOld, projectsData, 'Old Data', 'New Data');
    }
});

// Export for manual use
if (typeof window !== 'undefined') {
    window.compareDataFiles = compareDataFiles;
    window.validateDataStructure = validateDataStructure;
    window.findDataIssues = findDataIssues;
}
