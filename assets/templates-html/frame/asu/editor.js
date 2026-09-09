    (() => {
      const pageMode = document.querySelector('#pageMode');
      const modeStorageKey = 'asu-resume-page-mode';
      const contentStoragePrefix = 'asu-resume-content-v3';
      const sheets = Array.from(document.querySelectorAll('main.sheet'));
      const saveStatus = document.querySelector('#saveStatus');
      let saveTimer = null;

      const setSaveStatus = (text) => {
        if (saveStatus) saveStatus.textContent = text;
      };
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
          setSaveStatus('自动保存不可用');
          return false;
        }
      };
      const hashText = (text) => {
        let hash = 2166136261;
        for (let index = 0; index < text.length; index += 1) {
          hash ^= text.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16);
      };
      const contentStorageKey = `${contentStoragePrefix}-${hashText(window.location.href)}`;
      const originalSheets = sheets.map((sheet) => sheet.innerHTML);
      const templateHash = hashText(JSON.stringify(originalSheets));
      const restoreSavedContent = () => {
        const raw = getStoredValue(contentStorageKey);
        if (!raw) return;
        try {
          const saved = JSON.parse(raw);
          if (saved.templateHash !== templateHash || !Array.isArray(saved.sheets) || saved.sheets.length !== sheets.length) {
            setSaveStatus('模板已更新，未恢复旧内容');
            return;
          }
          sheets.forEach((sheet, index) => {
            if (typeof saved.sheets[index] === 'string') sheet.innerHTML = saved.sheets[index];
          });
          setSaveStatus('已恢复上次编辑');
        } catch (error) {
          setSaveStatus('自动保存已开启');
        }
      };
      const saveContent = () => {
        if (!sheets.length) return;
        const saved = setStoredValue(contentStorageKey, JSON.stringify({
          version: 2,
          templateHash,
          sheets: sheets.map((sheet) => sheet.innerHTML),
          savedAt: new Date().toISOString()
        }));
        if (saved) setSaveStatus('已自动保存');
      };
      const scheduleSave = () => {
        setSaveStatus('保存中...');
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(saveContent, 350);
      };

      restoreSavedContent();
      sheets.forEach((sheet) => sheet.addEventListener('input', scheduleSave));
      window.addEventListener('beforeunload', saveContent);

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
        try { localStorage.removeItem(contentStorageKey); } catch (error) { /* 忽略 */ }
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
        setSaveStatus('已恢复初始内容');
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

      document.addEventListener('resume-change', scheduleSave);
      document.addEventListener('resume-before-save', saveContent);
    })();
