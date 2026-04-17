function calculateCumulativeSums(arr) {
    return arr.reduce((accumulator, currentValue, currentIndex) => {
      // accumulator is an array holding the cumulative sums up to the current position.
      // For the first element, the cumulative-sum array has only one element: itself.
      if (currentIndex === 0) {
        return [currentValue];
      }

      // For other elements, take the last element of the current cumulative-sum array
      // (the previous position's cumulative sum), add the current value, and push the
      // new array into the cumulative-sum array.
      const newAccumulator = [...accumulator]; // Copy to avoid mutating the original.
      newAccumulator.push(
        newAccumulator[newAccumulator.length - 1] + currentValue
      );
      return newAccumulator;
    }, []); // Initial cumulative-sum array is empty.
  }

  
function formatNumber(num) {
    // Unit mapping table.
    const units = ["", "k", "M", "G", "T", "P"]; // Append more units as needed.

    // Convert to string for easier processing.
    let numStr = String(num);

    // Strip any commas or other non-numeric characters.
    numStr = numStr.replace(/[^0-9\.]/g, "");

    // Convert the string to a number.
    num = parseFloat(numStr);

    // Handle decimal places.
    num = parseFloat(num.toFixed(2)); // Keep two decimal places.

    // Handle units.
    let unitIndex = 0;
    while (num >= 1000) {
        num /= 1000;
        unitIndex++;
        if (unitIndex >= units.length) {
        // If the unit list can't represent a larger number, stop and return the original string.
        return numStr;
        }
    }

    // Format the string and append the unit.
    return `${parseFloat(num.toFixed(2))}${units[unitIndex]}`;
}


function getProjectValue(string) {
  const arr = string.split('(')
  const front = arr[0]
  let projectName = front
  let projectId = ''
  let back = arr[1]
  projectName = projectName.split(' - ')[0].toLowerCase()
  if(back) {
      back = back.replaceAll(')', '')
      const startIndex = back.indexOf('PRJ')
      if(startIndex >= 0) {
          projectId = back.slice(startIndex)
      }
  }
  return {
      projectName,
      projectId
  }
}

function getProjects() {
  const obj = {}
  document.querySelector('.Styles__markdown___AoORL').querySelectorAll('.Styles__link___jrhdD').forEach(a => {
    console.log(getProjectValue(a.innerText))
    const {projectName, projectId} = getProjectValue(a.innerText)
    obj[projectName] = projectId
  })

  return obj
}