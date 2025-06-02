document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservationForm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const guestsInput = document.getElementById('guests');
    
    const customGuestsSelectWrapper = document.getElementById('customGuestsSelectWrapper');
    const customGuestsSelectTrigger = customGuestsSelectWrapper.querySelector('.custom-select-trigger');
    const customGuestsOptionsContainer = customGuestsSelectWrapper.querySelector('.custom-options');
    
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const dateError = document.getElementById('dateError');
    const timeError = document.getElementById('timeError');
    const guestsError = document.getElementById('guestsError');
    const tablesError = document.getElementById('tablesError');
    
    const tables = document.querySelectorAll('.table-item');
    const submitButton = document.querySelector('.submit-button');
    const successPopup = document.getElementById('successPopup');
    const popupOverlay = document.getElementById('popupOverlay');
    
    let selectedTables = [];
    const RESERVED_TABLES_KEY = 'reservedRestaurantTables';
    
    function initializeCustomSelect() {
        Array.from(guestsInput.options).forEach(option => {
            const customOption = document.createElement('div');
            customOption.classList.add('custom-option');
            customOption.textContent = option.textContent;
            customOption.dataset.value = option.value;
            
            if (option.value === "") {
                customOption.classList.add('placeholder-option');
            }
            
            customGuestsOptionsContainer.appendChild(customOption);
            
            customOption.addEventListener('click', function() {
                customGuestsSelectTrigger.textContent = this.textContent;
                guestsInput.value = this.dataset.value;
                
                customGuestsSelectWrapper.classList.remove('open');
                
                customGuestsOptionsContainer.querySelectorAll('.custom-option.selected-option').forEach(opt => {
                    opt.classList.remove('selected-option');
                });
                this.classList.add('selected-option');
                
                const event = new Event('change', { bubbles: true });
                guestsInput.dispatchEvent(event);
            });
        });
        
        customGuestsSelectTrigger.addEventListener('click', () => {
            customGuestsSelectWrapper.classList.toggle('open');
        });
        
        customGuestsSelectTrigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                customGuestsSelectWrapper.classList.toggle('open');
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!customGuestsSelectWrapper.contains(e.target)) {
                customGuestsSelectWrapper.classList.remove('open');
            }
        });
    }
    
    function getReservedTables() {
        const storedTables = localStorage.getItem(RESERVED_TABLES_KEY);
        return storedTables ? new Set(JSON.parse(storedTables)) : new Set();
    }
    
    function saveReservedTables(reservedSet) {
        localStorage.setItem(RESERVED_TABLES_KEY, JSON.stringify(Array.from(reservedSet)));
    }
    
    let reservedTables = getReservedTables();
    
    function initializeTableStates() {
        const selectedGuestCount = parseInt(guestsInput.value) || 0;
        
        tables.forEach(table => {
            table.classList.remove('reserved', 'selected', 'unsuitable');
            const tableCapacity = parseInt(table.dataset.capacity);
            
            if (reservedTables.has(table.dataset.id)) {
                table.classList.add('reserved');
            }
            
            if (selectedGuestCount > 0 && tableCapacity < selectedGuestCount) {
                table.classList.add('unsuitable');
            }
        });
        
        selectedTables = [];
        
        filterTablesByGuests();
    }
    
    function filterTablesByGuests() {
        const selectedGuestCount = parseInt(guestsInput.value);
        
        tables.forEach(table => {
            const tableCapacity = parseInt(table.dataset.capacity);
            const tableId = table.dataset.id;
            
            table.classList.remove('unsuitable');
            
            if (reservedTables.has(tableId)) {
                return;
            }
            
            if (selectedGuestCount && tableCapacity < selectedGuestCount) {
                table.classList.add('unsuitable');
                
                if (selectedTables.includes(tableId)) {
                    selectedTables = selectedTables.filter(id => id !== tableId);
                    table.classList.remove('selected');
                }
            }
        });
        
        validateTables();
        updateSubmitButtonState();
    }
    
    function validateName() {
        if (nameInput.value.trim() === '') {
            nameInput.classList.add('invalid');
            nameError.style.display = 'block';
            return false;
        }
        nameInput.classList.remove('invalid');
        nameError.style.display = 'none';
        return true;
    }
    
    function validatePhone() {
        const phoneValue = phoneInput.value.replace(/[\s+-]/g, '');
        if (phoneValue.length >= 10 && /^[0-9]+$/.test(phoneValue)) {
            phoneInput.classList.remove('invalid');
            phoneError.style.display = 'none';
            return true;
        }
        phoneInput.classList.add('invalid');
        phoneError.style.display = 'block';
        return false;
    }
    
    function validateDate() {
        if (dateInput.value === '') {
            dateInput.classList.add('invalid');
            dateError.style.display = 'block';
            return false;
        }
        dateInput.classList.remove('invalid');
        dateError.style.display = 'none';
        return true;
    }
    
    function validateTime() {
        if (timeInput.value === '') {
            timeInput.classList.add('invalid');
            timeError.style.display = 'block';
            return false;
        }
        timeInput.classList.remove('invalid');
        timeError.style.display = 'none';
        return true;
    }
    
    function validateGuests() {
        if (guestsInput.value === '') {
            customGuestsSelectTrigger.classList.add('invalid');
            guestsError.style.display = 'block';
            filterTablesByGuests();
            return false;
        }
        customGuestsSelectTrigger.classList.remove('invalid');
        guestsError.style.display = 'none';
        filterTablesByGuests();
        return true;
    }
    
    function validateTables() {
        const suitableSelectedTables = selectedTables.filter(tableId => {
            const tableElement = document.querySelector(`.table-item[data-id="${tableId}"]`);
            return tableElement && !tableElement.classList.contains('unsuitable');
        });
        
        if (suitableSelectedTables.length === 0) {
            if (guestsInput.value !== '') {
                tablesError.style.display = 'block';
            } else {
                tablesError.style.display = 'none';
            }
            return false;
        }
        tablesError.style.display = 'none';
        return true;
    }
    
    function validateForm() {
        const isNameValid = validateName();
        const isPhoneValid = validatePhone();
        const isDateValid = validateDate();
        const isTimeValid = validateTime();
        const isGuestsValid = validateGuests();
        const areTablesSelectedAndSuitable = validateTables();
        
        return isNameValid && isPhoneValid && isDateValid && isTimeValid && 
               isGuestsValid && areTablesSelectedAndSuitable;
    }
    
    function updateSubmitButtonState() {
        const canEnable = nameInput.value.trim() !== '' &&
                          (phoneInput.value.replace(/[\s+-]/g, '').length >= 10 && 
                           /^[0-9]+$/.test(phoneInput.value.replace(/[\s+-]/g, ''))) &&
                          dateInput.value !== '' &&
                          timeInput.value !== '' &&
                          guestsInput.value !== '' &&
                          selectedTables.filter(tableId => {
                              const tableElement = document.querySelector(`.table-item[data-id="${tableId}"]`);
                              return tableElement && !tableElement.classList.contains('unsuitable');
                          }).length > 0;
        
        submitButton.disabled = !canEnable;
    }
    
    tables.forEach(table => {
        table.addEventListener('click', () => {
            const tableId = table.dataset.id;
            
            if (table.classList.contains('reserved') || table.classList.contains('unsuitable')) {
                console.warn(`Table ${tableId} is unavailable.`);
                return;
            }
            
            if (selectedTables.includes(tableId)) {
                table.classList.remove('selected');
                selectedTables = selectedTables.filter(id => id !== tableId);
            } else {
                table.classList.add('selected');
                selectedTables.push(tableId);
            }
            
            validateTables();
            updateSubmitButtonState();
        });
    });
    
    nameInput.addEventListener('input', () => { validateName(); updateSubmitButtonState(); });
    phoneInput.addEventListener('input', () => { validatePhone(); updateSubmitButtonState(); });
    dateInput.addEventListener('change', () => { validateDate(); updateSubmitButtonState(); });
    timeInput.addEventListener('change', () => { validateTime(); updateSubmitButtonState(); });
    guestsInput.addEventListener('change', () => { validateGuests(); updateSubmitButtonState(); });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            console.error('Form validation failed. Please check the highlighted fields.');
            return;
        }
        
        // Disable scrolling while popup is shown
        document.body.style.overflow = 'hidden';
        
        // Reset any previous state
        popupOverlay.classList.remove('show');
        successPopup.classList.remove('show');
        popupOverlay.style.display = 'none';
        successPopup.style.display = 'none';
        
        // Force a reflow
        void popupOverlay.offsetWidth;
        void successPopup.offsetWidth;
        
        // Show popup
        popupOverlay.style.display = 'block';
        successPopup.style.display = 'block';
        
        // Force another reflow
        void popupOverlay.offsetWidth;
        void successPopup.offsetWidth;
        
        popupOverlay.classList.add('show');
        successPopup.classList.add('show');
        
        selectedTables.forEach(tableId => {
            const tableElement = document.querySelector(`.table-item[data-id="${tableId}"]`);
            if (tableElement && !tableElement.classList.contains('unsuitable')) {
                reservedTables.add(tableId);
            }
        });
        saveReservedTables(reservedTables);
        
        selectedTables.forEach(tableId => {
            const tableElement = document.querySelector(`.table-item[data-id="${tableId}"]`);
            if (tableElement && !tableElement.classList.contains('unsuitable')) {
                tableElement.classList.add('reserved');
                tableElement.classList.remove('selected');
            }
        });
        
        setTimeout(() => {
            form.reset();
            
            customGuestsSelectTrigger.textContent = guestsInput.options[0].textContent;
            guestsInput.value = guestsInput.options[0].value;
            customGuestsOptionsContainer.querySelectorAll('.custom-option.selected-option').forEach(opt => {
                opt.classList.remove('selected-option');
            });
            if (customGuestsOptionsContainer.firstChild) {
                customGuestsOptionsContainer.firstChild.classList.add('selected-option');
            }
            
            selectedTables = [];
            initializeTableStates();
            
            nameError.style.display = 'none'; nameInput.classList.remove('invalid');
            phoneError.style.display = 'none'; phoneInput.classList.remove('invalid');
            dateError.style.display = 'none'; dateInput.classList.remove('invalid');
            timeError.style.display = 'none'; timeInput.classList.remove('invalid');
            guestsError.style.display = 'none'; customGuestsSelectTrigger.classList.remove('invalid');
            tablesError.style.display = 'none';
            
            updateSubmitButtonState();
            
            // Hide popup
            popupOverlay.classList.remove('show');
            successPopup.classList.remove('show');

            setTimeout(() => {
                popupOverlay.style.display = 'none';
                successPopup.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
            
        }, 1000);
    });
    
    initializeCustomSelect();
    initializeTableStates();
    updateSubmitButtonState();
    
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    const closePopupBtn = document.getElementById('closePopupBtn');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            popupOverlay.classList.remove('show');
            successPopup.classList.remove('show');
            setTimeout(() => {
                popupOverlay.style.display = 'none';
                successPopup.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        });
    }
});
