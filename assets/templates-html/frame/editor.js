(() => {
  const root = document.querySelector('.resume-page');
  const editButton = document.querySelector('[data-action="edit"]');
  const fontSelect = document.querySelector('[data-action="font"]');
  const colorInput = document.querySelector('[data-action="color"]');
  const boldButton = document.querySelector('[data-action="bold"]');
  const photoButton = document.querySelector('[data-action="photo"]');
  const pdfButton = document.querySelector('[data-action="pdf"]');
  const photoInput = document.querySelector('[data-photo-input]');
  let savedRange = null;
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !root.contains(selection.anchorNode)) return;
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
  };
  editButton?.addEventListener('click', () => {
    const editing = root.getAttribute('contenteditable') === 'true';
    root.setAttribute('contenteditable', String(!editing));
    root.classList.toggle('is-editing', !editing);
    editButton.textContent = editing ? '编辑' : '完成编辑';
    if (!editing) root.focus();
  });
  photoButton?.addEventListener('click', () => photoInput?.click());
  photoInput?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const image = document.querySelector('.photo-frame img'); if (image) image.src = reader.result; };
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
  pdfButton?.addEventListener('click', () => window.print());
})();
