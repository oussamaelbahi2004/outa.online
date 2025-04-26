/**
 * script.js
 * Combines Mobile Menu, Dark Mode, Form Submission to Google Sheets, and AOS Initialization.
 */

// --- Language Menu Toggle ---
document.addEventListener('DOMContentLoaded', function() {
    // Handle language dropdown menu toggle
    const languageToggle = document.getElementById('languageToggle');
    const languageMenu = document.getElementById('languageMenu');
    
    if (languageToggle && languageMenu) {
        languageToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            languageMenu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function() {
            if (languageMenu.classList.contains('show')) {
                languageMenu.classList.remove('show');
            }
        });
        
        // Prevent menu from closing when clicking inside it
        languageMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});

// --- Google Sheets Form Submission Configuration ---
// !! PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL HERE !!
// Get this URL after deploying the Code.gs script as a Web App.
const googleScriptURL = 'https://script.google.com/macros/s/AKfycbw6ljvojlWxrOWK6C_hPYPJ3YKF8waD61vDKH1q3gzyukN9s-QcB0Bm-m29Z34U3GzRUQ/exec'; // <--- REPLACE THIS with the URL from Step 3

// --- Mobile Menu Toggle ---
const menuBtn = document.getElementById('menu-btn');
const mainNav = document.getElementById('main-nav');

if (menuBtn && mainNav) {
    menuBtn.addEventListener('click', () => {
        // Toggle classes for mobile menu visibility
        mainNav.classList.toggle('active'); // Custom class for state tracking (optional)
        mainNav.classList.toggle('hidden'); // Hide/show based on Tailwind's 'hidden'
        mainNav.classList.toggle('flex');   // Use flex to display when not hidden
    });
}

// --- Country Code Selector Handling ---
const countryCodeSelect = document.getElementById('countryCode');
const customCodeContainer = document.getElementById('customCodeContainer');
const customCountryCode = document.getElementById('customCountryCode');

if (countryCodeSelect && customCodeContainer && customCountryCode) {
    // Show/hide custom code input based on selection
    countryCodeSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customCodeContainer.classList.remove('hidden');
            customCountryCode.required = true;
        } else {
            customCodeContainer.classList.add('hidden');
            customCountryCode.required = false;
        }
    });
}

// --- Dark Mode Toggle ---
const htmlElement = document.documentElement; // Target the <html> element
const darkModeToggle = document.getElementById('darkModeToggle'); // Desktop button
const darkModeToggleMobile = document.getElementById('darkModeToggleMobile'); // Mobile menu button

// Define icons for light/dark modes (HTML content)
const sunIcon = '<i class="fas fa-sun text-xl"></i>';
const moonIcon = '<i class="fas fa-moon text-xl"></i>';
const sunIconMobile = '<i class="fas fa-sun mr-2"></i> <span>Light Mode</span>';
const moonIconMobile = '<i class="fas fa-moon mr-2"></i> <span>Dark Mode</span>';

// Function to update the appearance of toggle buttons based on the current theme
const updateToggleButton = (isDarkMode) => {
    if (darkModeToggle) {
        // Set inner HTML of the desktop button
        darkModeToggle.innerHTML = isDarkMode ? sunIcon : moonIcon;
    }
    if (darkModeToggleMobile) {
        // Set inner HTML of the mobile button
        darkModeToggleMobile.innerHTML = isDarkMode ? sunIconMobile : moonIconMobile;
    }
};

// Determine the initial theme: check localStorage first, then system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : (prefersDark ? 'dark' : 'light');

// Apply the initial theme class to the <html> element
if (currentTheme === 'dark') {
    htmlElement.classList.add('dark');
} else {
    htmlElement.classList.remove('dark'); // Ensure 'dark' is not present for light mode
}
// Update the button icons/text to match the initial theme
updateToggleButton(currentTheme === 'dark');

// Function to toggle dark mode on/off
const toggleDarkMode = () => {
    // Toggle the 'dark' class on the <html> element and get the new state
    let isDark = htmlElement.classList.toggle('dark');
    // Save the user's preference to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // Update the button icons/text
    updateToggleButton(isDark);
};

// Attach click event listeners to both dark mode toggle buttons
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
}
if (darkModeToggleMobile) {
    darkModeToggleMobile.addEventListener('click', toggleDarkMode);
}

// Optional: Listen for changes in the system's color scheme preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // Only change the theme if the user hasn't explicitly set a preference in localStorage
    if (!localStorage.getItem('theme')) {
        const isSystemDark = e.matches;
        // Apply the system theme
        if (isSystemDark) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
        // Update the button appearance
        updateToggleButton(isSystemDark);
    }
});

// --- Form Handling (Request Page - Submit to Google Sheets) ---
const requestForm = document.getElementById('serviceRequestForm');
const formSuccessMessage = document.getElementById('formSuccess');
const formWrapper = document.querySelector('#serviceRequestForm'); // Use the form itself as the wrapper to hide
const submitButton = requestForm ? requestForm.querySelector('button[type="submit"]') : null; // Get the submit button

// Check if the form, button exist and the Google Script URL has been set
if (requestForm && submitButton && googleScriptURL && googleScriptURL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    requestForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the default browser form submission

        // --- Basic client-side validation ---
        let isValid = true;
        const fullName = document.getElementById('fullName');
        const phoneNumber = document.getElementById('phoneNumber');
        const countryCode = document.getElementById('countryCode');
        const customCountryCode = document.getElementById('customCountryCode');
        const email = document.getElementById('email');
        const service = document.getElementById('service');
        const fullNameError = document.getElementById('fullNameError');
        const phoneNumberError = document.getElementById('phoneNumberError');
        const countryCodeError = document.getElementById('countryCodeError');
        const emailError = document.getElementById('emailError');
        const serviceError = document.getElementById('serviceError');

        // Clear previous error messages
        [fullNameError, phoneNumberError, countryCodeError, emailError, serviceError].forEach(errorEl => {
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.style.display = 'none';
            }
        });

        // Validate Full Name (Required)
        if (fullName && fullName.value.trim() === '') {
            if (fullNameError) {
                 fullNameError.textContent = 'Full Name is required.';
                 fullNameError.style.display = 'block';
            }
            isValid = false;
        }
        
        // Validate Country Code and Phone Number
        let selectedCountryCode = '';
        
        // Check country code selection
        if (countryCode && countryCode.value === '') {
            if (countryCodeError) {
                countryCodeError.textContent = 'Please select a country code.';
                countryCodeError.style.display = 'block';
            }
            isValid = false;
        } else if (countryCode && countryCode.value === 'custom') {
            // Validate custom country code
            if (customCountryCode && customCountryCode.value.trim() === '') {
                if (countryCodeError) {
                    countryCodeError.textContent = 'Please enter a country code.';
                    countryCodeError.style.display = 'block';
                }
                isValid = false;
            } else if (customCountryCode && !/^\+[0-9]{1,4}$/.test(customCountryCode.value.trim())) {
                if (countryCodeError) {
                    countryCodeError.textContent = 'Country code must start with + followed by 1-4 digits.';
                    countryCodeError.style.display = 'block';
                }
                isValid = false;
            } else if (customCountryCode) {
                selectedCountryCode = customCountryCode.value.trim();
            }
        } else if (countryCode) {
            selectedCountryCode = countryCode.value;
        }
        
        // Validate Phone Number (Required)
        if (phoneNumber && phoneNumber.value.trim() === '') {
             if (phoneNumberError) {
                phoneNumberError.textContent = 'Phone Number is required.';
                phoneNumberError.style.display = 'block';
            }
            isValid = false;
        } else if (phoneNumber && !/^[0-9\s]+$/.test(phoneNumber.value.trim())) {
            if (phoneNumberError) {
                phoneNumberError.textContent = 'Please enter only numbers.';
                phoneNumberError.style.display = 'block';
            }
            isValid = false;
        }
        
        // Validate Email (Required)
        if (email && email.value.trim() === '') {
            if (emailError) {
                emailError.textContent = 'Email Address is required.';
                emailError.style.display = 'block';
            }
            isValid = false;
        } else if (email && !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.value.trim())) {
            if (emailError) {
                emailError.textContent = 'Please enter a valid email address.';
                emailError.style.display = 'block';
            }
            isValid = false;
        }
        
        // Validate Service (Required and not the default option)
        if (service && (service.value === '' || service.value === 'Select a service')) {
            if (serviceError) {
                serviceError.textContent = 'Please select a service.';
                serviceError.style.display = 'block';
            }
            isValid = false;
        }

        // --- If form is valid, send data to Google Sheets ---
        if (isValid) {
            const formData = new FormData(requestForm);
            const originalButtonText = submitButton.innerHTML;

            // Combine country code with phone number
            const fullPhoneNumber = selectedCountryCode + ' ' + phoneNumber.value.trim();
            
            // Remove individual country code fields and add the combined phone number
            formData.delete('countryCode');
            formData.delete('customCountryCode');
            formData.delete('phoneNumber');
            formData.append('phoneNumber', fullPhoneNumber);

            // Disable button and show loading state for visual feedback
            submitButton.disabled = true;
            submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...`;

            // Use fetch API to send data to the Google Apps Script Web App URL
            fetch(googleScriptURL, {
                method: 'POST',
                body: formData,
                // mode: 'no-cors' // Use 'no-cors' ONLY as a last resort if you face persistent CORS issues AND
                                  // you understand you won't get a success/error response back in JS.
                                  // The Apps Script will still run, but your JS won't know if it succeeded. Avoid if possible.
            })
            .then(response => {
                if (!response.ok && response.status !== 0) { // Status 0 can happen with 'no-cors' or network errors before response
                     // Handle HTTP errors (like 404, 500) - doesn't catch network errors initially
                    throw new Error(`HTTP error! Status: ${response.status}`);
                 }
                return response.json(); // Parse the JSON response from Apps Script
            })
            .then(data => {
                console.log('Google Sheets Response:', data);
                if (data.result === 'success') {
                    // --- Success ---
                    console.log("Form data successfully submitted to Google Sheets.");
                    if (formWrapper) formWrapper.style.display = 'none'; // Hide the form
                    if (formSuccessMessage) formSuccessMessage.classList.add('visible'); // Show the success message

                    // Optional: Reset the form fields if you are not hiding it permanently
                    // requestForm.reset();

                    // No need to re-enable the button if the form is hidden
                } else {
                    // --- Error reported by Apps Script (e.g., sheet not found) ---
                    console.error("Error submitting form (Apps Script):", data.message, data.error || '');
                    // Show an error message to the user
                    alert(`There was an error submitting your request: ${data.message || 'Please try again later.'}`);
                    // Re-enable the button and restore original text since submission failed
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            })
            .catch(error => {
                // --- Network error, CORS issue (if not using 'no-cors'), or fetch/parsing error ---
                console.error('Fetch Error:', error);
                // Show a generic error message to the user
                alert("Could not send request. Please check your internet connection and try again. If the problem persists, contact support.");
                // Re-enable the button and restore original text
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });

        } else {
            // If validation fails, log it or provide feedback (e.g., scroll to first error)
            console.log("Form validation failed.");
            // Find the first visible error message and focus its corresponding input
             const firstError = requestForm.querySelector('.error-message[style*="block"]');
            if (firstError) {
                 const inputId = firstError.id.replace('Error', ''); // Assumes IDs like 'fullNameError' -> 'fullName'
                 const inputElement = document.getElementById(inputId);
                 if (inputElement) {
                     inputElement.focus();
                }
            }
        }
    });

} else if (!requestForm) {
    console.error('Form with ID "serviceRequestForm" not found.');
} else if (!submitButton) {
    console.error('Submit button within the form "serviceRequestForm" not found.');
} else if (!googleScriptURL || googleScriptURL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
     // Warn if the URL placeholder hasn't been replaced
     console.warn('Google Apps Script URL is not set or is still the placeholder in script.js. Form submission will not work.');
     // Optionally, disable the submit button to prevent user confusion
     if (submitButton) {
         submitButton.disabled = true;
         submitButton.title = 'Form submission is currently disabled.';
         submitButton.style.opacity = '0.7';
         submitButton.style.cursor = 'not-allowed';
     }
}


// --- Animate On Scroll (AOS) Library Initialization ---
// Check if the AOS library is loaded (usually available globally as 'AOS')
if (typeof AOS !== 'undefined') {
    // Initialize AOS with desired settings
    AOS.init({
        duration: 700,          // Animation duration in milliseconds
        once: true,             // Whether animation should happen only once per element
        offset: 100,            // Offset (in px) from the original trigger point
        easing: 'ease-in-out', // Default easing for AOS animations
        // You can add more AOS options here if needed
    });
} else {
    // Log an error if AOS library is not found
    console.error('AOS library (aos.js) not loaded correctly. Animations will not work.');
}