(() => {
  const roots = Array.from(document.querySelectorAll('.resume-page, main.sheet'));
  const root = roots[0];
  if (!root) return;
  const saveStatus = document.querySelector('[data-save-status]');
  const setSaveStatus = (text) => {
    if (saveStatus) saveStatus.textContent = text;
  };
  const hashText = (text) => {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  };
  const contentStoragePrefix = root.matches('main.sheet') ? 'asu-resume-content-v3' : 'resume-content-v1';
  const contentStorageKey = `${contentStoragePrefix}-${hashText(window.location.href)}`;
  const originalRoots = roots.map((page) => page.innerHTML);
  const templateHash = hashText(JSON.stringify(originalRoots));
  let saveTimer = null;
  const getStoredValue = () => {
    try {
      return localStorage.getItem(contentStorageKey);
    } catch (error) {
      return null;
    }
  };
  const restoreSavedContent = () => {
    const raw = getStoredValue();
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved.templateHash !== templateHash || !Array.isArray(saved.sheets) || saved.sheets.length !== roots.length) {
        setSaveStatus('模板已更新，未恢复旧内容');
        return;
      }
      roots.forEach((page, index) => {
        if (typeof saved.sheets[index] === 'string') page.innerHTML = saved.sheets[index];
      });
      setSaveStatus('已恢复上次编辑');
    } catch (error) {
      setSaveStatus('自动保存已开启');
    }
  };
  const saveContent = () => {
    try {
      localStorage.setItem(contentStorageKey, JSON.stringify({
        version: 2,
        templateHash,
        sheets: roots.map((page) => page.innerHTML),
        savedAt: new Date().toISOString()
      }));
      setSaveStatus('已自动保存');
    } catch (error) {
      setSaveStatus('自动保存不可用');
    }
  };
  const scheduleSave = () => {
    setSaveStatus('保存中...');
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveContent, 350);
  };
  restoreSavedContent();
  roots.forEach((page) => page.addEventListener('input', scheduleSave));
  window.addEventListener('beforeunload', saveContent);
  document.addEventListener('resume-change', scheduleSave);
  document.addEventListener('resume-before-save', saveContent);
  const changed = () => document.dispatchEvent(new Event('resume-change'));
  const editButton = document.querySelector('[data-action="edit"]');
  const fontSelect = document.querySelector('[data-action="font"]');
  const colorInput = document.querySelector('[data-action="color"]');
  const boldButton = document.querySelector('[data-action="bold"]');
  const photoButton = document.querySelector('[data-action="photo"]');
  const autofitButton = document.querySelector('[data-action="autofit"]');
  const fitStatus = document.querySelector('[data-fit-status]');
  const saveButton = document.querySelector('[data-action="save"]');
  const pdfButton = document.querySelector('[data-action="pdf"]');
  const resetButton = document.querySelector('[data-action="reset"]');
  const photoInput = document.querySelector('[data-photo-input]');
  const photoFrame = document.querySelector('.photo-frame, .profile-photo-slot');
  const photoImage = photoFrame?.querySelector('img');
  const initialPhotoSource = photoImage?.getAttribute('src') || '';
  if (photoFrame && initialPhotoSource && !/fictional-resume-photo\.png(?:[?#].*)?$/i.test(initialPhotoSource)) {
    photoFrame.classList.add('has-photo');
  }
  let savedRange = null;
  if (resetButton) {
    let armed = false;
    let disarmTimer = null;
    const disarm = () => {
      armed = false;
      resetButton.classList.remove('armed');
      resetButton.textContent = '重置';
      window.clearTimeout(disarmTimer);
    };
    const resetEditor = () => {
      window.clearTimeout(saveTimer);
      try { localStorage.removeItem(contentStorageKey); } catch (error) { /* 忽略 */ }
      roots.forEach((page, index) => {
        page.innerHTML = originalRoots[index];
      });
      if (photoInput) photoInput.value = '';
      savedRange = null;
      setSaveStatus('已恢复文件初始内容');
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
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !roots.some((page) => page.contains(selection.anchorNode) && page.contains(selection.focusNode))) return;
    savedRange = selection.getRangeAt(0).cloneRange();
  });
  const restoreSelection = () => {
    if (!savedRange) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  };
  const applyFormat = (command, value = null) => {
    if (root.getAttribute('contenteditable') !== 'true') editButton.click();
    root.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    changed();
  };
  editButton?.addEventListener('click', () => {
    const editing = root.getAttribute('contenteditable') === 'true';
    roots.forEach((page) => {
      page.setAttribute('contenteditable', String(!editing));
      page.classList.toggle('is-editing', !editing);
    });
    editButton.textContent = editing ? '编辑' : '完成编辑';
    if (!editing) root.focus();
  });
  if (root.getAttribute('contenteditable') === 'true') editButton.textContent = '完成编辑';
  document.querySelectorAll('.resume-toolbar button').forEach((button) => {
    button.addEventListener('mousedown', (event) => event.preventDefault());
  });
  document.querySelectorAll('[data-command]').forEach((button) => {
    button.addEventListener('click', () => applyFormat(button.dataset.command));
  });
  document.querySelector('[data-action="font-size"]')?.addEventListener('change', (event) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!savedRange || !selection.rangeCount || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const wrapper = document.createElement('span');
    wrapper.style.fontSize = event.target.value;
    wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);
    range.selectNodeContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);
    savedRange = range.cloneRange();
    changed();
  });
  photoButton?.addEventListener('click', () => photoInput?.click());
  document.addEventListener('click', (event) => {
    if (event.target.closest?.('.profile-photo-slot')) photoInput?.click();
  });
  document.addEventListener('keydown', (event) => {
    if (event.target.closest?.('.profile-photo-slot') && ['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      photoInput?.click();
    }
  });
  photoInput?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/') || !photoFrame) return;
    const reader = new FileReader();
    reader.onload = () => {
      const photoFrame = document.querySelector('.photo-frame, .profile-photo-slot');
      if (!photoFrame) return;
      let image = photoFrame.querySelector('img');
      if (!image) {
        image = document.createElement('img');
        image.className = 'profile-photo';
        image.alt = '证件照';
        photoFrame.prepend(image);
      }
      image.src = reader.result;
      photoFrame.classList.add('has-photo');
      photoFrame.querySelector('.photo-placeholder')?.remove();
      setToolStatus('照片已替换');
      changed();
    };
    reader.readAsDataURL(file);
  });
  const localFontGroup = fontSelect ? fontSelect.querySelector('[data-local-font-group]') : null;
  const localFontButton = document.querySelector('[data-action="local-fonts"]');
  const importFontButton = document.querySelector('[data-action="import-font"]');
  const fontFileInput = document.querySelector('[data-font-file-input]');
  const toolbarTitle = document.querySelector('.toolbar-title');
  const localFontValuePrefix = 'local:';
  const removeLocalFontsValue = '__remove_local_fonts__';
  const installedFontBlocklist = ['icon', 'emoji', 'symbol', 'wingdings', 'webdings', 'dingbat', 'awesome'];
  const fontFaces = new Map();
  let localFonts = [];
  let installedFontNames = [];
  let statusTimer = null;

  const setToolStatus = (text) => {
    if (!toolbarTitle) return;
    toolbarTitle.textContent = text;
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => { toolbarTitle.textContent = 'HTML 简历'; }, 3000);
  };
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
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      try {
        await registerLocalFont(name, dataUrl);
      } catch (error) {
        setToolStatus('字体文件无法解析');
        resolve();
        return;
      }
      localFonts = localFonts.filter((font) => font.name !== name);
      localFonts.push({ name, data: dataUrl });
      setToolStatus('本地字体已导入（刷新后需重新导入）');
      resolve();
    };
    reader.onerror = () => {
      setToolStatus('字体文件无法读取');
      resolve();
    };
    reader.readAsDataURL(file);
  });
  const loadInstalledFonts = async () => {
    if (typeof window.queryLocalFonts !== 'function') {
      setToolStatus('当前浏览器不支持读取本地字体，可用「导入字体」');
      return;
    }
    setToolStatus('正在读取本地字体...');
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
      setToolStatus(`已读取 ${installedFontNames.length} 个本地字体`);
    } catch (error) {
      setToolStatus(error && error.name === 'NotAllowedError' ? '已拒绝本地字体读取权限' : '本地字体读取失败');
    }
  };
  const removeAllLocalFonts = () => {
    fontFaces.forEach((fontFace) => document.fonts.delete(fontFace));
    fontFaces.clear();
    localFonts = [];
    installedFontNames = [];
    refreshLocalFontOptions();
    setToolStatus('已清除本地字体');
  };

  const initAutofit = () => {
    if (!autofitButton || !fitStatus) return;
    const isSinglePage = roots.length === 1 && !document.body.classList.contains('variant-two-page');
    if (!isSinglePage) {
      autofitButton.disabled = true;
      autofitButton.textContent = '自动一页（双页不可用）';
      autofitButton.title = '双页模板保留原分页，不启用自动一页';
      fitStatus.textContent = '双页模板';
      return;
    }

    const MIN_SCALE = 0.9;
    const TOL = 1;
    const A4_HEIGHT_PX = (297 * 96) / 25.4;
    let autofitOn = root.dataset.autofit === 'true';
    let fitSuppress = false;
    let fitTimer = null;

    const measurePage = () => {
      const style = getComputedStyle(root);
      const paddingTop = parseFloat(style.paddingTop) || 0;
      const paddingBottom = parseFloat(style.paddingBottom) || 0;
      const maxHeight = A4_HEIGHT_PX - paddingTop - paddingBottom;
      const rootRect = root.getBoundingClientRect();
      const contentTop = rootRect.top + paddingTop;
      const bottoms = Array.from(root.querySelectorAll('*'))
        .filter((element) => {
          const elementStyle = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return elementStyle.display !== 'none'
            && elementStyle.visibility !== 'hidden'
            && elementStyle.position !== 'fixed'
            && rect.width > 0
            && rect.height > 0;
        })
        .map((element) => {
          const marginBottom = parseFloat(getComputedStyle(element).marginBottom) || 0;
          return element.getBoundingClientRect().bottom + marginBottom;
        });
      const used = bottoms.length ? Math.max(...bottoms) - contentTop : 0;
      return { maxHeight, used, overflow: used - maxHeight };
    };
    const forceLayout = () => { void root.offsetHeight; };
    const applyFit = (spacing, lineHeight, scale) => {
      root.dataset.fitSpacing = spacing;
      root.dataset.fitLh = lineHeight;
      root.dataset.fitScale = String(scale);
      root.style.setProperty('--resume-fit-scale', String(scale));
      root.style.setProperty('--resume-fit-width', `${100 / scale}%`);
      forceLayout();
    };
    const resetFit = () => applyFit('normal', 'normal', 1);
    const fillPercent = (measurement) => Math.round((Math.max(0, measurement.used) / measurement.maxHeight) * 100);
    const report = (text, kind = 'ok') => {
      fitStatus.textContent = text;
      fitStatus.classList.toggle('warn', kind === 'warn');
    };
    const paintOverflow = (flag) => { root.dataset.fitOverflow = String(flag); };
    const fitByScale = () => {
      let low = MIN_SCALE;
      let high = 1;
      for (let index = 0; index < 14; index += 1) {
        const middle = (low + high) / 2;
        applyFit('tight', 'tight', middle);
        if (measurePage().overflow <= TOL) low = middle;
        else high = middle;
      }
      let scale = Math.round(low * 100) / 100;
      applyFit('tight', 'tight', scale);
      if (measurePage().overflow > TOL && scale > MIN_SCALE) {
        scale = Math.max(MIN_SCALE, Math.round((scale - 0.01) * 100) / 100);
        applyFit('tight', 'tight', scale);
      }
      return scale;
    };
    const autofit = () => {
      if (fitSuppress) return;
      fitSuppress = true;
      try {
        resetFit();
        const defaultMeasurement = measurePage();
        if (defaultMeasurement.overflow <= TOL) {
          paintOverflow(false);
          report(`已适配 · 占用 ${fillPercent(defaultMeasurement)}% · 默认排版`);
          return;
        }
        applyFit('tight', 'normal', 1);
        const spacingMeasurement = measurePage();
        if (spacingMeasurement.overflow <= TOL) {
          paintOverflow(false);
          report(`已适配 · 压缩间距 · 占用 ${fillPercent(spacingMeasurement)}%`);
          return;
        }
        applyFit('tight', 'tight', 1);
        const lineHeightMeasurement = measurePage();
        if (lineHeightMeasurement.overflow <= TOL) {
          paintOverflow(false);
          report(`已适配 · 压缩间距+行距 · 占用 ${fillPercent(lineHeightMeasurement)}%`);
          return;
        }
        const scale = fitByScale();
        const scaleMeasurement = measurePage();
        if (scaleMeasurement.overflow <= TOL) {
          paintOverflow(false);
          report(`已适配 · 字号 ${Math.round(scale * 100)}% · 占用 ${fillPercent(scaleMeasurement)}%`);
          return;
        }
        paintOverflow(true);
        report(`仍溢出 ${Math.round(scaleMeasurement.overflow)}px · 建议精简内容或改为双页`, 'warn');
      } finally {
        fitSuppress = false;
      }
    };
    const checkOverflowOnly = () => {
      const measurement = measurePage();
      const overflowing = measurement.overflow > TOL;
      paintOverflow(overflowing);
      report(overflowing
        ? `超出单页 ${Math.round(measurement.overflow)}px · 可开启自动一页`
        : `一页内 · 占用 ${fillPercent(measurement)}%`, overflowing ? 'warn' : 'ok');
    };
    const scheduleFit = () => {
      if (fitSuppress) return;
      window.clearTimeout(fitTimer);
      fitTimer = window.setTimeout(autofitOn ? autofit : checkOverflowOnly, 400);
    };
    const updateButton = () => {
      autofitButton.setAttribute('aria-pressed', String(autofitOn));
      autofitButton.textContent = autofitOn ? '自动一页：开' : '自动一页';
    };

    autofitButton.addEventListener('click', () => {
      autofitOn = !autofitOn;
      root.dataset.autofit = String(autofitOn);
      updateButton();
      if (autofitOn) autofit();
      else {
        resetFit();
        checkOverflowOnly();
      }
    });
    const observer = new MutationObserver(scheduleFit);
    observer.observe(root, { subtree: true, childList: true, characterData: true });
    document.addEventListener('resume-change', scheduleFit);
    updateButton();
    const initialCheck = () => { if (autofitOn) autofit(); else checkOverflowOnly(); };
    if (document.fonts?.ready) document.fonts.ready.then(initialCheck);
    else initialCheck();
  };
  initAutofit();

  const suggestedHtmlName = () => {
    const currentName = decodeURIComponent(window.location.pathname.split('/').pop() || '');
    if (/\.html?$/i.test(currentName)) return currentName;
    const safeTitle = (document.title || 'resume').replace(/[\\/:*?"<>|]+/g, '-').trim();
    return `${safeTitle || 'resume'}.html`;
  };
  const serializeHtml = () => {
    document.dispatchEvent(new Event('resume-before-save'));
    const clone = document.documentElement.cloneNode(true);
    const clonedRoot = clone.querySelector('.resume-page');
    const clonedEditButton = clone.querySelector('[data-action="edit"]');
    const clonedToolbarTitle = clone.querySelector('.toolbar-title');
    if (clonedRoot) {
      clonedRoot.setAttribute('contenteditable', 'false');
      clonedRoot.classList.remove('is-editing');
    }
    clone.querySelectorAll('main.sheet').forEach((page) => page.setAttribute('contenteditable', 'true'));
    if (clonedEditButton) clonedEditButton.textContent = '编辑';
    if (clonedToolbarTitle) clonedToolbarTitle.textContent = 'HTML 简历';
    const clonedStatus = clone.querySelector('[data-save-status]');
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
        setToolStatus('HTML 已保存到本地');
        return;
      } catch (error) {
        if (error?.name === 'AbortError') {
          setToolStatus('已取消保存');
          return;
        }
      }
    }
    downloadHtml(html, name);
    setToolStatus('已下载 HTML 副本');
  };

  fontSelect?.addEventListener('change', () => {
    const value = fontSelect.value;
    if (value === removeLocalFontsValue) {
      removeAllLocalFonts();
      fontSelect.value = 'Microsoft YaHei';
      return;
    }
    if (value.startsWith(localFontValuePrefix)) {
      applyFormat('fontName', `"${value.slice(localFontValuePrefix.length)}", "Microsoft YaHei", sans-serif`);
      return;
    }
    applyFormat('fontName', value);
  });
  localFontButton?.addEventListener('click', () => { loadInstalledFonts(); });
  importFontButton?.addEventListener('click', () => {
    if (!('FontFace' in window && 'fonts' in document)) {
      setToolStatus('当前浏览器不支持导入字体文件');
      return;
    }
    fontFileInput?.click();
  });
  fontFileInput?.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setToolStatus('正在导入字体...');
    for (const file of files) await importFontFile(file);
    refreshLocalFontOptions();
  });
  colorInput?.addEventListener('input', () => applyFormat('foreColor', colorInput.value));
  boldButton?.addEventListener('click', () => applyFormat('bold'));
  saveButton?.addEventListener('click', saveHtml);
  pdfButton?.addEventListener('click', () => window.print());
})();
