(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const themeToggle = document.querySelector('.theme-toggle');
  const year = document.querySelector('#year');

  if (year) year.textContent = new Date().getFullYear();

  const setMenu = (open) => {
    if (!menuToggle || !siteNav) return;
    siteNav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  };

  menuToggle?.addEventListener('click', () => setMenu(!siteNav?.classList.contains('is-open')));
  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  const storedTheme = window.localStorage.getItem('asu-theme');
  if (storedTheme === 'light') body.dataset.theme = 'light';
  const updateThemeButton = () => {
    if (!themeToggle) return;
    const light = body.dataset.theme === 'light';
    themeToggle.textContent = light ? '☾' : '☼';
    themeToggle.setAttribute('aria-label', light ? '切换深色模式' : '切换浅色模式');
    themeToggle.title = light ? '切换深色模式' : '切换浅色模式';
  };
  updateThemeButton();
  themeToggle?.addEventListener('click', () => {
    const light = body.dataset.theme === 'light';
    if (light) delete body.dataset.theme;
    else body.dataset.theme = 'light';
    window.localStorage.setItem('asu-theme', light ? 'dark' : 'light');
    updateThemeButton();
  });

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  document.querySelectorAll('.copy-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const originalText = button.textContent;
      try {
        await navigator.clipboard.writeText(button.dataset.copy || '');
        button.textContent = '已复制';
        button.classList.add('is-copied');
        window.setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('is-copied');
        }, 1600);
      } catch {
        button.textContent = '请手动复制';
        window.setTimeout(() => { button.textContent = originalText; }, 1600);
      }
    });
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
