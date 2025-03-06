document.addEventListener('DOMContentLoaded', () => {
    // Обработка кликов по кнопкам комментариев
    document.querySelectorAll('.comment-button').forEach(button => {
        button.addEventListener('click', () => {
            const postId = button.getAttribute('data-post-id');
            const commentsSection = document.getElementById(`comments-${postId}`);
            if (commentsSection.style.display === 'none' || commentsSection.style.display === '') {
                commentsSection.style.display = 'block'; // Показываем секцию комментариев
            } else {
                commentsSection.style.display = 'none'; // Скрываем секцию комментариев
            }
        });
    });
});
