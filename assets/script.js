// 图片懒加载
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// 搜索功能增强
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    let searchData = [];

    if (searchInput) {
        fetch('/search.json')
            .then(res => res.json())
            .then(data => {
                searchData = data;
                // 支持URL参数预填
                const urlParams = new URLSearchParams(window.location.search);
                const q = urlParams.get('query') || '';
                if (q) {
                    searchInput.value = q;
                    renderResults(doSearch(searchData, q), q);
                }
            });

        function triggerSearch() {
            const keyword = searchInput.value;
            renderResults(doSearch(searchData, keyword), keyword);
        }

        searchInput.addEventListener('input', triggerSearch);
        if (searchButton) {
            searchButton.addEventListener('click', triggerSearch);
        }
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                triggerSearch();
            }
        });
    }
});

// 平滑滚动
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
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
});

// 代码块复制功能
document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.textContent = '复制';
        button.className = 'copy-button';
        button.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            padding: 4px 8px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
        `;
        
        const pre = block.parentElement;
        pre.style.position = 'relative';
        pre.appendChild(button);
        
        button.addEventListener('click', function() {
            navigator.clipboard.writeText(block.textContent).then(() => {
                button.textContent = '已复制';
                setTimeout(() => {
                    button.textContent = '复制';
                }, 2000);
            });
        });
    });
});

// 主题切换（暗色模式）
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);
        
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});

// 返回顶部按钮
document.addEventListener('DOMContentLoaded', function() {
    const backToTop = document.createElement('button');
    backToTop.textContent = '↑';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background: #007acc;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 18px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 1000;
    `;
    
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
        } else {
            backToTop.style.opacity = '0';
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// 全文检索功能
function highlight(text, keyword) {
    if (!keyword) return text;
    const reg = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(reg, '<span class="match-keyword">$1</span>');
}

function renderResults(results, keyword) {
    const container = document.querySelector('.search-results');
    if (!container) return;
    if (!results.length) {
        container.innerHTML = '<div class="no-results">未找到相关内容</div>';
        return;
    }
    container.innerHTML = results.map(item => `
        <div class="search-result">
            <a href="${item.url}"><strong>${highlight(item.title, keyword)}</strong></a>
            <div class="result-meta">
                ${(item.tags || []).map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                ${(item.categories || []).map(cat => `<span class="category">${cat}</span>`).join(' ')}
            </div>
            <div class="result-excerpt">${highlight(item.summary || item.content.slice(0, 120), keyword)}</div>
        </div>
    `).join('');
}

function doSearch(data, keyword) {
    if (!keyword) return [];
    keyword = keyword.trim().toLowerCase();
    return data.filter(item => {
        return (
            item.title.toLowerCase().includes(keyword) ||
            (item.summary && item.summary.toLowerCase().includes(keyword)) ||
            ((item.tags || []).join(' ').toLowerCase().includes(keyword)) ||
            ((item.categories || []).join(' ').toLowerCase().includes(keyword)) ||
            item.content.toLowerCase().includes(keyword)
        );
    });
} 