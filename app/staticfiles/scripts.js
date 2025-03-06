// Функция для переключения лайка
function toggleLike(btn) {
    btn.classList.toggle('liked');
}

// Функция для показа/скрытия комментариев в конкретном посте
function toggleComments(btn) {
    const blogPost = btn.closest('.blog-post');
    const commentsSection = blogPost.querySelector('.comments-section');
    commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
}

// Пагинация
// Показываем посты для нужной страницы: pageNum = 1 или 2
function showPage(pageNum) {
    const posts = document.querySelectorAll('.blog-post');
    posts.forEach(post => {
        if (post.classList.contains('page-' + pageNum)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
    // Обновляем активное состояние кнопок пагинации
    const pageButtons = document.querySelectorAll('.pagination .page-number');
    pageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === String(pageNum)) {
            btn.classList.add('active');
        }
    });
}

// Функция для перехода "назад" и "вперёд"
function changePage(direction) {
    const current = document.querySelector('.pagination .page-number.active');
    let currentPage = parseInt(current.textContent.trim());
    if (direction === 'prev' && currentPage > 1) {
        showPage(currentPage - 1);
    }
    if (direction === 'next' && currentPage < 2) {
        showPage(currentPage + 1);
    }
}

// По умолчанию показываем первую страницу
document.addEventListener("DOMContentLoaded", function() {
    showPage(1);
});
