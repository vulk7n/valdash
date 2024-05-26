// home.js

document.addEventListener('DOMContentLoaded', () => {
    const primaryButton = document.querySelector('.primary');
    const outlineButton = document.querySelector('.outline');
    const redButton = document.querySelector('.outline.red');

    // Event listener for the primary button
    primaryButton.addEventListener('click', () => {
        // Handle the click action for the primary button
        console.log('Primary button clicked!');
        // You can add logic here to navigate to another page or perform an action
        window.location.href = 'rank.html';
    });

    // Disable right-click context menu
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });
  

    // Event listener for the outline button
    outlineButton.addEventListener('click', () => {
        // Handle the click action for the outline button
        console.log('Outline button clicked!');
    });

    // Event listener for the red button
    redButton.addEventListener('click', () => {
        // Handle the click action for the red button
        console.log('Red button clicked!');
    });
});
