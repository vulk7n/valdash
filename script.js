document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const body = document.body;
  const suggestedUsersSelect = document.getElementById('suggestedUsers');
  const regionSelect = document.getElementById('region');
  const deleteButton = document.getElementById('delete-button');
  const clearHistoryButton = document.getElementById('clear-history-button');
  const autoRegionToggle = document.getElementById('auto-region-toggle');

  // Add event listener for dark mode toggle
  darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
  });

  // Automatically load saved user data
  const savedUsers = JSON.parse(localStorage.getItem('savedUsers')) || [];

  savedUsers.forEach(user => {
    const option = document.createElement('option');
    option.value = `${user.username}#${user.tag}-${user.region}`;
    option.text = `${user.username}#${user.tag} - ${user.region}`;
    suggestedUsersSelect.add(option);
  });

// Add event listener for the delete button
if (deleteButton) {
  deleteButton.addEventListener('click', () => {
    const selectedUser = suggestedUsersSelect.value;

    if (selectedUser) {
      // Split selectedUser to get username, tag, and region
      const [savedUsername, tagRegion] = selectedUser.split('#');

      // Split tagRegion to get tag and region
      const [tag, region] = tagRegion.split('-');

      // Find the index of the selected user in savedUsers
      const userIndex = savedUsers.findIndex(user => user.username === savedUsername && user.tag === tag && user.region === region);

      if (userIndex !== -1) {
        // Remove the selected user from savedUsers
        savedUsers.splice(userIndex, 1);
        localStorage.setItem('savedUsers', JSON.stringify(savedUsers));

        // Update the dropdown menu
        displaySavedUsers();
      }
    }
  });
}

// Get the clear button element
const clearButton = document.getElementById('clear-button');

// Add event listener for the clear button
if (clearButton) {
  clearButton.addEventListener('click', () => {
    // Clear the input fields
    usernameInput.value = '';
    tagInput.value = '';
    regionSelect.value = 'ap'; // Set to an empty string or your default region value
  });
}



  // Add event listener for the clear history button
  if (clearHistoryButton) {
    clearHistoryButton.addEventListener('click', () => {
      // Clear all saved users from local storage
      localStorage.removeItem('savedUsers');

      // Update the dropdown menu
      displaySavedUsers();
    });
  }

  // Add event listener for the automatic region select toggle
  if (autoRegionToggle) {
    autoRegionToggle.addEventListener('change', () => {
      // Save the toggle status to localStorage
      localStorage.setItem('autoRegionToggle', autoRegionToggle.checked);

      // If the toggle is checked, refresh the page to trigger automatic region selection
      if (autoRegionToggle.checked) {
        location.reload();
      }
    });

    // Set initial state based on local storage
    autoRegionToggle.checked = localStorage.getItem('autoRegionToggle') === 'true';
  }

  // Function to get the user's location information based on their IP address
  const getUserLocation = async () => {
    const ipinfoToken = '20dd7d9462f9ab'; // Replace with your ipinfo token
    const response = await fetch(`https://ipinfo.io/json?token=${ipinfoToken}`);
    const data = await response.json();
    return data.country || 'default';
  };

  // Function to determine the region based on the user's IP address
  const autoSelectRegion = async () => {
    const cachedRegion = localStorage.getItem('userLocation');

    if (cachedRegion) {
      // If the region is cached, use it
      regionSelect.value = cachedRegion;
      console.log('Region set from cache:', cachedRegion);
    } else {
      // If not cached, fetch user's location and cache it
      try {
        const userLocation = await getUserLocation();

        console.log('User location:', userLocation);

        // Map specific countries to the 'ap' region
        const apCountries = ['IN', 'PK', 'SG', 'PH'];

        // Check if the user's country code is in the list of Asia Pacific countries
        if (apCountries.includes(userLocation.toUpperCase())) {
          regionSelect.value = 'ap';
          console.log('Region set to Asia Pacific (ap).');
        } else {
          // Add logic for other regions if needed
          regionSelect.value = 'default'; // Set a default value if the user's region is not in 'ap'
          console.log('Region set to default.');
        }

        // Cache the user's location in local storage
        localStorage.setItem('userLocation', regionSelect.value);
      } catch (error) {
        console.error('Error getting user location:', error);

        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          console.log('Retrying with a backup method or default values...');
          // Add backup logic or use default values if needed
        } else {
          regionSelect.value = 'default'; // Set a default value if the user's region can't be determined
          console.log('Region set to default due to an error.');
        }
      }
    }
  };

  // Valorant stats functionality
  const usernameInput = document.getElementById('username');
  const tagInput = document.getElementById('tag');
  const checkStatsButton = document.getElementById('check-stats');
  const statsDisplay = document.getElementById('stats-display');

  // Listen for input changes in the username field
  usernameInput.addEventListener('input', () => {
    // Clear the suggested user selection when a new username is entered
    suggestedUsersSelect.value = '';
  });

  checkStatsButton.addEventListener('click', () => {
    const enteredUsername = usernameInput.value.trim();
    const selectedUser = suggestedUsersSelect.value;
    const [savedUsername, tagRegion] = selectedUser ? selectedUser.split('#') : [enteredUsername, tagInput.value];

    // Split tagRegion to get tag and region
    let [tag, region] = tagRegion ? tagRegion.split('-') : ['', regionSelect.value];  // Use the selected region

    // If no region is selected and no default is provided, use 'ap' as a fallback
    region = region || 'ap';

    // If a suggested user is selected, fill the input fields
    if (selectedUser) {
      usernameInput.value = savedUsername;
      tagInput.value = tag;
      regionSelect.value = region;
    }

    // Validate input (optional)
    if (!savedUsername || !tag) {
      alert('Please enter both username and tag.');
      return;
    }

    // Construct API endpoint URL
    const apiUrl = `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${savedUsername}/${tag}`;

    // Fetch player data and handle response
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error fetching player stats: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 200) {
          const { currenttier, currenttierpatched, images, ranking_in_tier, mmr_change_to_last_game, elo } = data.data;

          // Build HTML content with rank, RR, MMR, and MMR change indicator
          const mmrChange = mmr_change_to_last_game;
          const mmrChangeSign = mmrChange >= 0 ? '+' : '-';

          const content = `
            <p>Rank: ${currenttierpatched} (${ranking_in_tier}/100 RR)</p>
            <p>MMR: ${elo}</p>
            <p>Last Game RR Change: ${mmrChangeSign}${Math.abs(mmrChange)}</p>
            <img src="${images.large}" alt="${currenttierpatched} rank icon">
          `;

          // Display stats in the #stats-display element
          statsDisplay.innerHTML = content;
          statsDisplay.style.display = 'block'; // Show the stats

          // Save the username, tag, and region in local storage
          saveUser(savedUsername, tag, region);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please check your internet connection and try again.');
      });
  });

  // Function to save the username, tag, and region in local storage
  const saveUser = (username, tag, region) => {
    const cleanUsername = username.replace(/\s/g, ''); // Remove spaces from the username
    const existingUser = savedUsers.find(user => user.username === cleanUsername && user.tag === tag && user.region === region);

    if (!existingUser) {
      // Save the username, tag, and region in savedUsers
      savedUsers.push({ username: cleanUsername, tag, region });
      localStorage.setItem('savedUsers', JSON.stringify(savedUsers));

      // Update the dropdown menu
      displaySavedUsers();
    }
  };

  // Function to display saved users in the dropdown menu
  const displaySavedUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('savedUsers')) || [];

    // Clear existing options
    suggestedUsersSelect.innerHTML = '';

    // Add saved users to the dropdown menu
    savedUsers.forEach(user => {
      const option = document.createElement('option');
      option.value = `${user.username}#${user.tag}-${user.region}`;
      option.text = `${user.username}#${user.tag} - ${user.region}`;
      suggestedUsersSelect.appendChild(option);
    });
  };

  // Trigger automatic region selection on page load
  autoSelectRegion();
});
