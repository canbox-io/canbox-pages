// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 导航栏滚动效果
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// 元素进入视口动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 为所有卡片添加动画
document.querySelectorAll('.feature-card, .usage-card, .doc-card, .download-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ========== 截图轮播图 ==========
function initScreenshotCarousel() {
    const carousel = document.getElementById('screenshot-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const viewport = carousel.querySelector('.carousel-viewport');
    const dotsContainer = document.getElementById('screenshot-dots');
    const btnPrev = carousel.querySelector('.carousel-btn-prev');
    const btnNext = carousel.querySelector('.carousel-btn-next');
    const cards = track.querySelectorAll('.screenshot-card');

    if (!track || !viewport || !dotsContainer || !btnPrev || !btnNext || cards.length === 0) return;

    const GAP = 20; // 1.25rem gap
    let currentPage = 0;
    let totalPages = 1;
    let slidesPerView = 3;

    function getSlidesPerView() {
        const vw = viewport.offsetWidth;
        if (vw < 580) return 1;
        if (vw < 800) return 2;
        return 3;
    }

    function update() {
        slidesPerView = getSlidesPerView();
        const vw = viewport.offsetWidth;
        const cardWidth = (vw - GAP * (slidesPerView - 1)) / slidesPerView;
        totalPages = Math.ceil(cards.length / slidesPerView);

        // 确保 currentPage 不越界
        if (currentPage >= totalPages) currentPage = totalPages - 1;
        if (currentPage < 0) currentPage = 0;

        // 设置卡片宽度
        cards.forEach(card => {
            card.style.width = cardWidth + 'px';
        });

        // 定位 track
        const offset = -currentPage * (cardWidth + GAP) * slidesPerView;
        track.style.transform = 'translateX(' + offset + 'px)';

        // 更新箭头状态
        btnPrev.style.opacity = currentPage === 0 ? '0.4' : '1';
        btnPrev.style.pointerEvents = currentPage === 0 ? 'none' : 'auto';
        btnNext.style.opacity = currentPage >= totalPages - 1 ? '0.4' : '1';
        btnNext.style.pointerEvents = currentPage >= totalPages - 1 ? 'none' : 'auto';

        // 更新指示点
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
            dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 页');
            dot.addEventListener('click', function () {
                currentPage = i;
                update();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function goNext() {
        if (currentPage < totalPages - 1) {
            currentPage++;
            update();
        }
    }

    function goPrev() {
        if (currentPage > 0) {
            currentPage--;
            update();
        }
    }

    btnPrev.addEventListener('click', goPrev);
    btnNext.addEventListener('click', goNext);

    // 响应窗口变化
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(update, 150);
    });

    // 初始渲染
    update();
}

// ========== 截图 Lightbox ==========
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    if (!lightbox || !lightboxImg || !lightboxCaption) return;

    const carousel = document.getElementById('screenshot-carousel');
    if (!carousel) return;

    // 事件委托：carousel track 上的点击
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;

    track.addEventListener('click', function (e) {
        const card = e.target.closest('.screenshot-card');
        if (!card) return;
        const img = card.querySelector('.screenshot-img-wrapper img');
        const caption = card.querySelector('.screenshot-info h3');
        if (img) {
            lightboxImg.src = img.src;
            lightboxCaption.textContent = caption ? caption.textContent : '';
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// 语言切换功能
let currentLang = 'zh';

function switchLanguage(lang) {
    currentLang = lang;
    const translatableElements = document.querySelectorAll('[data-zh]');

    translatableElements.forEach(el => {
        const zhText = el.getAttribute('data-zh');
        const enText = el.getAttribute('data-en');

        if (lang === 'en' && enText) {
            el.textContent = enText;
        } else if (lang === 'zh' && zhText) {
            el.textContent = zhText;
        }
    });

    // 更新 meta 标签
    const metaDescription = document.querySelector('meta[name="description"]');
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const pageTitle = document.querySelector('title');

    if (lang === 'en') {
        if (metaDescription) {
            metaDescription.setAttribute('content', metaDescription.getAttribute('data-en'));
        }
        if (metaKeywords) {
            metaKeywords.setAttribute('content', metaKeywords.getAttribute('data-en'));
        }
        if (pageTitle) {
            pageTitle.textContent = pageTitle.getAttribute('data-en');
        }
        document.documentElement.setAttribute('lang', 'en');
    } else {
        if (metaDescription) {
            metaDescription.setAttribute('content', metaDescription.getAttribute('data-zh'));
        }
        if (metaKeywords) {
            metaKeywords.setAttribute('content', metaKeywords.getAttribute('data-zh'));
        }
        if (pageTitle) {
            pageTitle.textContent = pageTitle.getAttribute('data-zh');
        }
        document.documentElement.setAttribute('lang', 'zh-CN');
    }

    // 更新语言切换按钮状态
    const langLinks = document.querySelectorAll('.lang-switch a');
    langLinks.forEach(link => {
        if (link.getAttribute('href') === '#' + lang) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 保存到 localStorage
    localStorage.setItem('lang', lang);
}

// 初始化语言
function initLanguage() {
    const savedLang = localStorage.getItem('lang') || 'zh';
    switchLanguage(savedLang);
}

// 绑定语言切换事件
document.querySelectorAll('.lang-switch a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const lang = this.getAttribute('href').substring(1);
        switchLanguage(lang);
    });
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initScreenshotCarousel();
    initLightbox();
});
