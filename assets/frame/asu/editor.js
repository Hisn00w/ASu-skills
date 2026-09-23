    (() => {
      const pageMode = document.querySelector('#pageMode');
      const modeStorageKey = 'asu-resume-page-mode';
      const sheets = Array.from(document.querySelectorAll('main.sheet'));
      const getStoredValue = (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          return null;
        }
      };
      const setStoredValue = (key, value) => {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (error) {
          return false;
        }
      };
      const originalSheets = sheets.map((sheet) => sheet.innerHTML);

      const applyMode = (mode) => {
        document.body.dataset.pageMode = mode;
        pageMode.value = mode;
      };
      applyMode(getStoredValue(modeStorageKey) || 'paged');
      pageMode.addEventListener('change', () => {
        applyMode(pageMode.value);
        setStoredValue(modeStorageKey, pageMode.value);
      });

      const resetButton = document.querySelector('#resetButton');
      const resetEditor = () => {
        sheets.forEach((sheet, index) => {
          sheet.innerHTML = originalSheets[index];
        });
        document.querySelectorAll('.profile-photo-slot').forEach((slot) => {
          const photo = slot.querySelector('.profile-photo');
          if (photo) photo.remove();
          if (!slot.querySelector('.photo-placeholder')) {
            const placeholder = document.createElement('span');
            placeholder.className = 'photo-placeholder';
            placeholder.innerHTML = '证件照<br>预留位置';
            slot.appendChild(placeholder);
          }
          slot.classList.remove('has-photo');
        });
        const photoInput = document.querySelector('[data-photo-input]');
        if (photoInput) photoInput.value = '';
        document.dispatchEvent(new Event('resume-reset'));
      };
      if (resetButton) {
        let armed = false;
        let disarmTimer = null;
        const disarm = () => {
          armed = false;
          resetButton.classList.remove('armed');
          resetButton.textContent = '重置';
          window.clearTimeout(disarmTimer);
        };
        resetButton.addEventListener('click', () => {
          if (!armed) {
            armed = true;
            resetButton.classList.add('armed');
            resetButton.textContent = '再点一次确认重置';
            window.clearTimeout(disarmTimer);
            disarmTimer = window.setTimeout(disarm, 3000);
            return;
          }
          disarm();
          resetEditor();
        });
        resetButton.addEventListener('mouseleave', () => {
          if (armed) disarmTimer = window.setTimeout(disarm, 800);
        });
        resetButton.addEventListener('mouseenter', () => {
          window.clearTimeout(disarmTimer);
        });
      }
    })();
