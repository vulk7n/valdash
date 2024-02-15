document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const suggestedUsersSelect = document.getElementById('suggestedUsers');
  const checkStatsButton = document.getElementById('check-stats');
  const statsDisplay = document.getElementById('stats-display');
  const clearButton = document.getElementById('clear-button');

  // Automatically load saved user data
  const savedUsers = JSON.parse(localStorage.getItem('savedUsers')) || [];

  savedUsers.forEach(user => {
    const option = document.createElement('option');
    option.value = `${user.username}#${user.tag}`;
    option.text = `${user.username}#${user.tag}`;
    suggestedUsersSelect.add(option);
  });

  // Disable right-click context menu
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  // Add event listener for the delete button
  const deleteButton = document.getElementById('delete-button');
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      const selectedUser = suggestedUsersSelect.value;

      if (selectedUser) {
        // Split selectedUser to get username, tag, and region
        const [savedUsername, tag] = selectedUser.split('#');

        // Find the index of the selected user in savedUsers
        const userIndex = savedUsers.findIndex(user => user.username === savedUsername && user.tag === tag);

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

  // Add event listener for the clear history button
  const clearHistoryButton = document.getElementById('clear-history-button');
  if (clearHistoryButton) {
    clearHistoryButton.addEventListener('click', () => {
      // Clear all saved users from local storage
      localStorage.removeItem('savedUsers');

      // Update the dropdown menu
      displaySavedUsers();
    });
  }

  // Add event listener for the clear button
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      // Clear the input fields for username and tag
      usernameInput.value = '';
      tagInput.value = '';

      // Optional: Clear the suggested user selection in the dropdown
      suggestedUsersSelect.value = '';

      // Optional: Clear the stats display
      statsDisplay.innerHTML = '';
      statsDisplay.style.display = 'none';
    });
  }

  
  // Valorant stats functionality
  const usernameInput = document.getElementById('username');
  const tagInput = document.getElementById('tag');

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
    let [tag, region] = tagRegion ? tagRegion.split('-') : ['', ''];  // Initialize region with an empty string
  
    if (region) {
      // Use the saved region directly if available
      searchStats(savedUsername, tag, region);
    } else {
      // Iterate through all regions if no saved region is available
      const regions = ['na', 'br', 'ap', 'eu', 'kr', 'latam'];
      let failedRequests = 0;

      for (const currentRegion of regions) {
        searchStats(savedUsername, tag, currentRegion)
          .catch(() => {
            // Count failed requests
            failedRequests++;

            // Check if all regions failed, then show the error
            if (failedRequests === regions.length) {
              showErrorNotification();
            }
          });
      }
    }
  });

  // Function to search for stats using the specified region
  const searchStats = (savedUsername, tag, region) => {
    const apiUrl = `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${savedUsername}/${tag}`;

    return fetch(apiUrl)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`Error fetching player stats for ${region}: ${response.statusText}`);
      })
      .then(data => {
        // Display the stats for the successful response
        const { currenttierpatched, ranking_in_tier, mmr_change_to_last_game, elo, images } = data.data;

        const mmrChange = mmr_change_to_last_game;
        const mmrChangeSign = mmrChange >= 0 ? '+' : '-';

        const content = `
          <p>Region: ${region}</p>
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
      });
  };

  // Function to show an error notification
  const showErrorNotification = () => {
    // Show an error notification for invalid username or tag
    alert('Invalid username or tag');
  };

  // Function to save the username, tag, and region in local storage
  const saveUser = (username, tag) => {
    const cleanUsername = username.replace(/\s/g, ''); // Remove spaces from the username
    const existingUser = savedUsers.find(user => user.username === cleanUsername && user.tag === tag);

    if (!existingUser) {
      // Save the username, tag, and region in savedUsers
      savedUsers.push({ username: cleanUsername, tag, });
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
      option.value = `${user.username}#${user.tag}`;
      option.text = `${user.username}#${user.tag}`;
      suggestedUsersSelect.appendChild(option);
    });
  };
});
