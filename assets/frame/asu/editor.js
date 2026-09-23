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
      const applyMode = (mode) => {
        document.body.dataset.pageMode = mode;
        pageMode.value = mode;
      };
      applyMode(getStoredValue(modeStorageKey) || 'paged');
      pageMode.addEventListener('change', () => {
        applyMode(pageMode.value);
        setStoredValue(modeStorageKey, pageMode.value);
      });
    })();
