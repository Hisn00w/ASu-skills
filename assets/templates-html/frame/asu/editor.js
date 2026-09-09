    (() => {
      const pageMode = document.querySelector('#pageMode');
      const modeStorageKey = 'asu-resume-page-mode';
      const contentStoragePrefix = 'asu-resume-content-v3';
      const sheets = Array.from(document.querySelectorAll('main.sheet[contenteditable="true"]'));
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

      const openPhotoPicker = (slot) => slot?.querySelector('.photo-input')?.click();
      document.addEventListener('click', (event) => {
        const slot = event.target.closest?.('.profile-photo-slot');
        if (!slot) return;
        const input = slot.querySelector('.photo-input');
        if (event.target !== input) openPhotoPicker(slot);
      });
      document.addEventListener('keydown', (event) => {
        const slot = event.target.closest?.('.profile-photo-slot');
        if (!slot) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPhotoPicker(slot);
        }
      });
      document.addEventListener('change', (event) => {
        const input = event.target.closest?.('.photo-input');
        const slot = input?.closest('.profile-photo-slot');
        if (!input || !slot) return;
        const [file] = input.files || [];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          let photo = slot.querySelector('.profile-photo');
          if (!photo) {
            photo = document.createElement('img');
            photo.className = 'profile-photo';
            photo.alt = '证件照';
            slot.prepend(photo);
          }
          photo.src = reader.result;
          slot.querySelector('.photo-placeholder')?.remove();
          slot.classList.add('has-photo');
          scheduleSave();
        });
        reader.readAsDataURL(file);
      });

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
            slot.insertBefore(placeholder, slot.querySelector('.photo-input'));
          }
          slot.classList.remove('has-photo');
        });
        const photoInput = document.querySelector('.photo-input');
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

      const editorSelector = '[contenteditable="true"]';
      const getElement = (node) => node && (node.nodeType === 1 ? node : node.parentElement);
      const isEditorSelection = (node) => {
        const element = getElement(node);
        return Boolean(element && element.closest(editorSelector) && !element.closest('.toolbar'));
      };
      let savedRange = null;
      document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (selection.rangeCount && isEditorSelection(selection.anchorNode) && isEditorSelection(selection.focusNode)) {
          savedRange = selection.getRangeAt(0).cloneRange();
        }
      });

      const restoreSelection = () => {
        if (!savedRange) return false;
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
        return true;
      };
      const runCommand = (command, value = null) => {
        if (!restoreSelection()) return;
        document.execCommand(command, false, value);
        scheduleSave();
      };

      document.querySelectorAll('.tool-button[data-command]').forEach((button) => {
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => runCommand(button.dataset.command));
      });

      const fontFamilies = {
        simhei: 'SimHei, 黑体, Microsoft YaHei, sans-serif',
        yahei: 'Microsoft YaHei, sans-serif',
        simsun: 'SimSun, 宋体, serif',
        times: 'Times New Roman, serif',
        arial: 'Arial, sans-serif'
      };
      const fontFamilySelect = document.querySelector('#fontFamily');
      const localFontGroup = fontFamilySelect ? fontFamilySelect.querySelector('#localFontGroup') : null;
      const fontFileInput = document.querySelector('#fontFileInput');
      const localFontButton = document.querySelector('#localFontButton');
      const importFontButton = document.querySelector('#importFontButton');
      const localFontValuePrefix = 'local:';
      const removeLocalFontsValue = '__remove_local_fonts__';
      const supportsLocalFonts = 'FontFace' in window && 'fonts' in document;
      const installedFontBlocklist = ['icon', 'emoji', 'symbol', 'wingdings', 'webdings', 'dingbat', 'awesome'];
      const fontFaces = new Map();
      let localFonts = [];
      let installedFontNames = [];

      const registerLocalFont = async (name, dataUrl) => {
        const fontFace = new FontFace(name, `url(${dataUrl})`);
        await fontFace.load();
        const previous = fontFaces.get(name);
        if (previous) document.fonts.delete(previous);
        document.fonts.add(fontFace);
        fontFaces.set(name, fontFace);
      };
      const refreshLocalFontOptions = () => {
        if (!localFontGroup) return;
        const names = [];
        installedFontNames.forEach((name) => {
          if (!names.includes(name)) names.push(name);
        });
        localFonts.forEach((font) => {
          if (!names.includes(font.name)) names.push(font.name);
        });
        localFontGroup.innerHTML = '';
        names.forEach((name) => {
          const option = document.createElement('option');
          option.value = localFontValuePrefix + name;
          option.textContent = name;
          localFontGroup.appendChild(option);
        });
        if (names.length) {
          const removeOption = document.createElement('option');
          removeOption.value = removeLocalFontsValue;
          removeOption.textContent = '移除全部本地字体';
          localFontGroup.appendChild(removeOption);
        }
      };
      const importFontFile = (file) => new Promise((resolve) => {
        const name = (file.name || '本地字体').replace(/\.(ttf|otf|ttc|woff2?|sfnt)$/i, '').trim() || '本地字体';
        const reader = new FileReader();
        reader.addEventListener('load', async () => {
          const dataUrl = String(reader.result || '');
          try {
            await registerLocalFont(name, dataUrl);
          } catch (error) {
            setSaveStatus('字体文件无法解析');
            resolve();
            return;
          }
          localFonts = localFonts.filter((font) => font.name !== name);
          localFonts.push({ name, data: dataUrl });
          setSaveStatus('本地字体已导入（刷新后需重新导入）');
          resolve();
        });
        reader.addEventListener('error', () => {
          setSaveStatus('字体文件无法读取');
          resolve();
        });
        reader.readAsDataURL(file);
      });
      const loadInstalledFonts = async () => {
        if (typeof window.queryLocalFonts !== 'function') {
          setSaveStatus('当前浏览器不支持读取本地字体，可用「导入字体」');
          return;
        }
        setSaveStatus('正在读取本地字体...');
        try {
          const fonts = await window.queryLocalFonts();
          const families = new Set();
          fonts.forEach((font) => {
            if (!font || typeof font.family !== 'string') return;
            const family = font.family.trim();
            if (!family) return;
            const lower = family.toLowerCase();
            if (installedFontBlocklist.some((part) => lower.includes(part))) return;
            families.add(family);
          });
          installedFontNames = Array.from(families).sort((a, b) => a.localeCompare(b));
          refreshLocalFontOptions();
          setSaveStatus(`已读取 ${installedFontNames.length} 个本地字体`);
        } catch (error) {
          setSaveStatus(error && error.name === 'NotAllowedError' ? '已拒绝本地字体读取权限' : '本地字体读取失败');
        }
      };
      const removeAllLocalFonts = () => {
        fontFaces.forEach((fontFace) => document.fonts.delete(fontFace));
        fontFaces.clear();
        localFonts = [];
        installedFontNames = [];
        refreshLocalFontOptions();
        setSaveStatus('已清除本地字体');
      };

      const suggestedHtmlName = () => {
        const currentName = decodeURIComponent(window.location.pathname.split('/').pop() || '');
        if (/\.html?$/i.test(currentName)) return currentName;
        const safeTitle = (document.title || 'asu-resume').replace(/[\\/:*?"<>|]+/g, '-').trim();
        return `${safeTitle || 'asu-resume'}.html`;
      };
      const serializeHtml = () => {
        const clone = document.documentElement.cloneNode(true);
        const clonedStatus = clone.querySelector('#saveStatus');
        if (clonedStatus) clonedStatus.textContent = '自动保存已开启';
        if (localFonts.length) {
          let fontStyle = clone.querySelector('style[data-saved-local-fonts]');
          if (!fontStyle) {
            fontStyle = document.createElement('style');
            fontStyle.setAttribute('data-saved-local-fonts', '');
            clone.querySelector('head')?.appendChild(fontStyle);
          }
          fontStyle.textContent = localFonts.map((font) => {
            const name = font.name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            return `@font-face{font-family:"${name}";src:url(${font.data})}`;
          }).join('\n');
        }
        return '<!doctype html>\n' + clone.outerHTML;
      };
      const downloadHtml = (html, name) => {
        const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      const saveHtml = async () => {
        saveContent();
        const html = serializeHtml();
        const name = suggestedHtmlName();
        if (typeof window.showSaveFilePicker === 'function') {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: name,
              types: [{ description: 'HTML 文件', accept: { 'text/html': ['.html', '.htm'] } }]
            });
            const writable = await handle.createWritable();
            await writable.write(new Blob([html], { type: 'text/html;charset=utf-8' }));
            await writable.close();
            setSaveStatus('HTML 已保存到本地');
            return;
          } catch (error) {
            if (error?.name === 'AbortError') {
              setSaveStatus('已取消保存');
              return;
            }
          }
        }
        downloadHtml(html, name);
        setSaveStatus('已下载 HTML 副本');
      };
      document.querySelector('#saveHtmlButton')?.addEventListener('click', saveHtml);

      fontFamilySelect?.addEventListener('change', (event) => {
        const value = event.target.value;
        if (value === removeLocalFontsValue) {
          removeAllLocalFonts();
          event.target.value = 'simhei';
          return;
        }
        if (value.startsWith(localFontValuePrefix)) {
          const name = value.slice(localFontValuePrefix.length);
          runCommand('fontName', `"${name}", "Microsoft YaHei", sans-serif`);
          return;
        }
        runCommand('fontName', fontFamilies[value]);
      });
      localFontButton?.addEventListener('mousedown', (event) => event.preventDefault());
      localFontButton?.addEventListener('click', () => {
        loadInstalledFonts();
      });
      importFontButton?.addEventListener('mousedown', (event) => event.preventDefault());
      importFontButton?.addEventListener('click', () => {
        if (!supportsLocalFonts) {
          setSaveStatus('当前浏览器不支持导入字体文件');
          return;
        }
        fontFileInput?.click();
      });
      fontFileInput?.addEventListener('change', async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';
        if (!files.length) return;
        setSaveStatus('正在导入字体...');
        for (const file of files) await importFontFile(file);
        refreshLocalFontOptions();
      });

      const applyInlineStyle = (property, value) => {
        if (!restoreSelection()) return;
        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) return;
        const range = selection.getRangeAt(0);
        const wrapper = document.createElement('span');
        wrapper.style[property] = value;
        wrapper.appendChild(range.extractContents());
        range.insertNode(wrapper);
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        selection.removeAllRanges();
        selection.addRange(newRange);
        savedRange = newRange.cloneRange();
        scheduleSave();
      };
      document.querySelector('#fontSize').addEventListener('change', (event) => {
        applyInlineStyle('fontSize', event.target.value);
      });
      document.querySelector('#textColor').addEventListener('input', (event) => {
        runCommand('foreColor', event.target.value);
      });
    })();
