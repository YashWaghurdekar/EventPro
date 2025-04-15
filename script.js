// Sample booked dates (in a real application, this would come from a backend)
const bookedDates = [
    '2024-03-15',
    '2024-03-20',
    '2024-03-25'
];

// Event types with their details
const eventTypes = {
    wedding: {
        name: 'Wedding',
        icon: 'fas fa-ring',
        color: '#e74c3c'
    },
    birthday: {
        name: 'Birthday Party',
        icon: 'fas fa-birthday-cake',
        color: '#f39c12'
    },
    conference: {
        name: 'Conference',
        icon: 'fas fa-users',
        color: '#3498db'
    },
    meeting: {
        name: 'Business Meeting',
        icon: 'fas fa-briefcase',
        color: '#2ecc71'
    },
    seminar: {
        name: 'Seminar',
        icon: 'fas fa-chalkboard-teacher',
        color: '#9b59b6'
    },
    exhibition: {
        name: 'Exhibition',
        icon: 'fas fa-palette',
        color: '#1abc9c'
    }
};

// Store all events
let allEvents = [];

// Initialize Flatpickr calendar with enhanced options
const calendar = flatpickr("#calendar", {
    inline: true,
    minDate: "today",
    disable: bookedDates,
    dateFormat: "Y-m-d",
    onChange: function(selectedDates, dateStr) {
        document.getElementById('eventDate').value = dateStr;
        updateEventList();
        updateEventTypeColors();
    }
});

// Form validation and submission
const bookingForm = document.getElementById('bookingForm');
const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateForm()) {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            eventType: document.getElementById('eventType').value,
            attendees: document.getElementById('attendees').value,
            eventDate: document.getElementById('eventDate').value,
            notes: document.getElementById('notes').value,
            status: 'booked',
            ticketId: generateTicketId()
        };

        // Show loading state
        showLoadingState();
        
        // Simulate form submission
        simulateBooking(formData);
    }
});

// Enhanced form validation
function validateForm() {
    let isValid = true;
    const form = document.getElementById('bookingForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value) {
            showValidationError(input, 'This field is required');
            isValid = false;
        } else {
            removeValidationError(input);
        }
    });

    // Email validation
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value && !emailRegex.test(email.value)) {
        showValidationError(email, 'Please enter a valid email address');
        isValid = false;
    }

    // Phone validation
    const phone = document.getElementById('phone');
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (phone.value && !phoneRegex.test(phone.value)) {
        showValidationError(phone, 'Please enter a valid phone number');
        isValid = false;
    }

    // Event date validation
    const eventDate = document.getElementById('eventDate');
    if (!eventDate.value) {
        showValidationError(eventDate, 'Please select a date');
        isValid = false;
    }

    return isValid;
}

// Show validation error
function showValidationError(input, message) {
    input.classList.add('is-invalid');
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    }
}

// Remove validation error
function removeValidationError(input) {
    input.classList.remove('is-invalid');
}

// Show loading state
function showLoadingState() {
    document.body.classList.add('loading');
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
}

// Remove loading state
function removeLoadingState() {
    document.body.classList.remove('loading');
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-check-circle me-2"></i>Book Event';
}

// Simulate booking submission
function simulateBooking(formData) {
    // Simulate API call
    setTimeout(() => {
        removeLoadingState();
        
        // Add to booked dates
        bookedDates.push(formData.eventDate);
        calendar.set('disable', bookedDates);
        
        // Add to all events
        allEvents.push(formData);
        
        // Show confirmation
        showConfirmation(formData);
        
        // Update event list
        updateEventList();
        
        // Reset form
        bookingForm.reset();
        
        // Generate and download ticket
        generateTicket(formData);
    }, 1500);
}

// Show booking confirmation
function showConfirmation(formData) {
    const bookingDetails = document.getElementById('bookingDetails');
    const eventType = eventTypes[formData.eventType];
    
    bookingDetails.innerHTML = `
        <div class="booking-summary">
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Name:</strong> ${formData.name}</p>
                    <p><strong>Email:</strong> ${formData.email}</p>
                    <p><strong>Phone:</strong> ${formData.phone}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Event Type:</strong> <i class="${eventType.icon} me-2"></i>${eventType.name}</p>
                    <p><strong>Date:</strong> ${formatDate(formData.eventDate)}</p>
                    <p><strong>Attendees:</strong> ${formData.attendees}</p>
                </div>
            </div>
            ${formData.notes ? `<p class="mt-3"><strong>Notes:</strong> ${formData.notes}</p>` : ''}
        </div>
    `;
    confirmationModal.show();
}

// Update event list
function updateEventList() {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = ''; // Clear existing events
    
    // Sort events by date
    allEvents.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    
    // Add all events to the list
    allEvents.forEach(event => {
        const eventType = eventTypes[event.eventType];
        const eventCard = document.createElement('div');
        eventCard.className = 'col-md-6 col-lg-4 mb-4';
        eventCard.innerHTML = `
            <div class="event-card shadow-sm">
                <div class="event-header d-flex justify-content-between align-items-center p-3 border-bottom">
                    <div class="d-flex align-items-center">
                        <i class="${eventType.icon} me-2" style="color: ${eventType.color}; font-size: 1.2em;"></i>
                        <h5 class="mb-0">${eventType.name}</h5>
                    </div>
                    <span class="badge ${event.status === 'booked' ? 'bg-danger' : 'bg-success'} ms-2">${event.status}</span>
                </div>
                <div class="event-details p-3">
                    <div class="mb-2">
                        <i class="fas fa-calendar-day me-2 text-muted"></i>
                        <span>${formatDate(event.eventDate)}</span>
                    </div>
                    <div class="mb-2">
                        <i class="fas fa-user me-2 text-muted"></i>
                        <span>${event.name}</span>
                    </div>
                    <div class="mb-2">
                        <i class="fas fa-users me-2 text-muted"></i>
                        <span>${event.attendees} attendees</span>
                    </div>
                    ${event.notes ? `
                    <div class="mt-2 pt-2 border-top">
                        <i class="fas fa-sticky-note me-2 text-muted"></i>
                        <span class="text-muted">${event.notes}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
        eventList.appendChild(eventCard);
    });
}

// Update event type colors
function updateEventTypeColors() {
    const eventTypeSelect = document.getElementById('eventType');
    const selectedOption = eventTypeSelect.options[eventTypeSelect.selectedIndex];
    if (selectedOption.value) {
        const eventType = eventTypes[selectedOption.value];
        eventTypeSelect.style.borderColor = eventType.color;
    } else {
        eventTypeSelect.style.borderColor = '';
    }
}

// Format date
function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// Generate and download ticket
function generateTicket(formData) {
    const downloadButton = document.getElementById('downloadTicket');
    downloadButton.addEventListener('click', function() {
        // Create ticket content
        const ticketContent = `
            <div class="ticket">
                <h2>Event Ticket</h2>
                <p><strong>Event:</strong> ${eventTypes[formData.eventType].name}</p>
                <p><strong>Date:</strong> ${formatDate(formData.eventDate)}</p>
                <p><strong>Attendee:</strong> ${formData.name}</p>
                <p><strong>Ticket ID:</strong> ${formData.ticketId}</p>
            </div>
        `;
        
        // Create and download PDF (simulated)
        alert('Ticket downloaded successfully!');
    });
}

// Generate random ticket ID
function generateTicketId() {
    return 'TICKET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Initialize event list with sample events
function initializeEventList() {
    const sampleEvents = [
        {
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+1234567890',
            eventType: 'conference',
            attendees: 50,
            eventDate: '2024-03-10',
            notes: 'Tech Conference 2024',
            status: 'booked',
            ticketId: generateTicketId()
        },
        {
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+1987654321',
            eventType: 'wedding',
            attendees: 100,
            eventDate: '2024-03-12',
            notes: 'Smith Wedding',
            status: 'booked',
            ticketId: generateTicketId()
        }
    ];

    // Add sample events to allEvents
    allEvents = [...sampleEvents];
    
    // Update the event list
    updateEventList();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventList();
    
    // Add event type color change listener
    document.getElementById('eventType').addEventListener('change', updateEventTypeColors);
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}); 