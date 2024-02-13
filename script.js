const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
});

// Valorant stats functionality
const regionSelect = document.getElementById('region');
const usernameInput = document.getElementById('username');
const tagInput = document.getElementById('tag');
const checkStatsButton = document.getElementById('check-stats');
const statsDisplay = document.getElementById('stats-display');

checkStatsButton.addEventListener('click', () => {
  const region = regionSelect.value;
  const username = usernameInput.value;
  const tag = tagInput.value;

  // Validate input (optional)
  if (!username || !tag) {
    alert('Please enter both username and tag.');
    return;
  }

  // Construct API endpoint URL
  // ... existing code
  

  const apiUrl = `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${username}/${tag}`;


  // Fetch player data and handle response
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.status === 200) {
        const { currenttier, currenttierpatched, images, ranking_in_tier, mmr_change_to_last_game, elo } = data.data;

        // Build HTML content with rank, RR, MMR, and MMR change indicator
        let mmrChangeSign = '';
        if (mmr_change_to_last_game > 0) {
        mmrChangeSign = '<span style="color: green;">&#9883; +</span>';
        } else if (mmr_change_to_last_game < 0) {
        mmrChangeSign = '<span style="color: red;">&#9882; -</span>';
        } else {
        mmrChangeSign = ''; // No sign if MMR change is 0
        }

const content = `
  <p>Rank: ${currenttierpatched} (${ranking_in_tier}/100 RR)</p>
  <p>MMR: ${elo}</p>
  <p>Last Game RR Change: ${Math.abs(mmr_change_to_last_game)}</p>
  <img src="${images.large}" alt="${currenttierpatched} rank icon">
`;

        // Display stats in the #stats-display element
        statsDisplay.innerHTML = content;
        statsDisplay.style.display = 'block'; // Show the stats
      } else {
        // Handle API error
        alert('Error fetching player stats. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please check your internet connection and try again.');
    });
});
