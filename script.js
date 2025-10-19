// Wait for the entire HTML document to load before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get the display screen and all the buttons
    const display = document.querySelector('.display');
    const buttons = document.querySelector('.buttons');

    // Add a single click event listener to the parent container of the buttons
    buttons.addEventListener('click', (event) => {
        // Check if the clicked element is actually a button
        if (!event.target.matches('button')) {
            return;
        }

        const button = event.target;
        const value = button.value;
        let displayValue = display.value;

        // Use a switch statement to handle different button types
        switch (value) {
            case 'C':
                // Clear the display
                display.value = '';
                break;
            
            case 'DEL':
                // Delete the last character
                display.value = displayValue.slice(0, -1);
                break;

            case '=':
                // Try to calculate the result
                try {
                    // Use eval() to compute the string expression.
                    // Note: eval() can be a security risk in complex apps, but it's fine for this simple project.
                    display.value = eval(displayValue);
                } catch (error) {
                    // If there's an error (e.g., "5++2"), show "Error"
                    display.value = 'Error';
                }
                break;

            default:
                // For all other buttons (numbers, operators), append their value to the display
                display.value += value;
                break;
        }
    });
});