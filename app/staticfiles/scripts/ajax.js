document.addEventListener('DOMContentLoaded', function() {
    // 1. Обработка лайков постов
    document.addEventListener('click', function(e) {
        // Лайк поста
        if (e.target.closest('.like-button')) {
            e.preventDefault();
            const button = e.target.closest('.like-button');
            const form = button.closest('.like-form');
            const formData = new FormData(form);
            const likeCount = button.querySelector('.like-count');
            const likeIcon = button.querySelector('i');
            
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                likeCount.textContent = data.like_count;
                button.classList.toggle('liked', data.liked);
                likeIcon.classList.toggle('far', !data.liked);
                likeIcon.classList.toggle('fas', data.liked);
            })
            .catch(error => console.error('Error:', error));
        }

        // Лайк комментария
        if (e.target.closest('.like-comment-button')) {
            e.preventDefault();
            const button = e.target.closest('.like-comment-button');
            const form = button.closest('.like-comment-form');
            const formData = new FormData(form);
            const likeCount = button.querySelector('.comment-like-count');
            const likeIcon = button.querySelector('i');
            
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                likeCount.textContent = data.like_count;
                button.classList.toggle('liked', data.liked);
                likeIcon.classList.toggle('far', !data.liked);
                likeIcon.classList.toggle('fas', data.liked);
                button.style.color = data.liked ? '#ff4d4d' : '';
            })
            .catch(error => console.error('Error:', error));
        }
    });

    // 2. Обработка отправки нового комментария
    document.getElementById('commentForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const textarea = this.querySelector('textarea');
        
        fetch(this.action, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            },

            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            isSubmitting = false; // Сбрасываем флаг после получения ответа

        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            const commentsContainer = document.querySelector('.existing-comments');
            if (commentsContainer.querySelector('.no-comments')) {
                commentsContainer.innerHTML = '';
            }
            
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.id = `comment-${data.comment_id}`;
            newComment.innerHTML = `
                <div class="comment-author">
                    <div class="comment-avatar">
                        ${data.avatar_url ? `<img src="${data.avatar_url}" alt="${data.author}">` : '<i class="fas fa-user-circle"></i>'}
                    </div>
                    <div class="comment-info">
                        <span class="comment-author-name">${data.author}</span>
                        <span class="comment-date">${data.date}</span>
                    </div>
                </div>
                <div class="comment-text">${data.text}</div>
                <div class="comment-actions">
                    <form action="/comment/${data.comment_id}/like/" method="post" class="like-comment-form">
                        <input type="hidden" name="csrfmiddlewaretoken" value="${data.csrf_token}">
                        <button type="button" class="action-button like-comment-button">
                            <i class="far fa-heart"></i>
                            <span class="comment-like-count">0</span>
                        </button>
                    </form>
                    <button type="button" class="action-button edit-comment-button" 
                            data-comment-id="${data.comment_id}"
                            data-text="${data.text.replace(/"/g, '"')}">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <form action="/comment/${data.comment_id}/delete/" method="post" class="delete-comment-form">
                        <input type="hidden" name="csrfmiddlewaretoken" value="${data.csrf_token}">
                        <button type="button" class="action-button danger-button delete-comment-button" 
                                data-comment-id="${data.comment_id}">
                            <i class="fas fa-trash-alt"></i> Удалить
                        </button>
                    </form>
                </div>
            `;
            
            commentsContainer.prepend(newComment);
            textarea.value = '';
            
            document.querySelectorAll('.comments-title').forEach(el => {
                el.innerHTML = `<i class="far fa-comments"></i> Комментарии (${data.comment_count})`;
            });
        })
        .catch(error => {
            isSubmitting = false; // Сбрасываем флаг в случае ошибки
            console.error('Error:', error);
        });

    });

    // 3. Обработка модальных окон
    const deleteCommentModal = document.getElementById('deleteCommentModal');
    const editCommentModal = document.getElementById('editCommentModal');

    // Открытие модальных окон
    document.addEventListener('click', function(e) {
        // Удаление комментария
        if (e.target.closest('.delete-comment-button')) {
            e.preventDefault();
            const button = e.target.closest('.delete-comment-button');
            deleteCommentModal.dataset.commentId = button.dataset.commentId;
            deleteCommentModal.dataset.url = button.closest('form').action;
            deleteCommentModal.dataset.csrfToken = button.closest('.comment').querySelector('[name=csrfmiddlewaretoken]').value;
            deleteCommentModal.style.display = 'flex';
        }
        
        // Редактирование комментария
        if (e.target.closest('.edit-comment-button')) {
            e.preventDefault();
            const button = e.target.closest('.edit-comment-button');
            editCommentModal.dataset.commentId = button.dataset.commentId;
            editCommentModal.dataset.url = `/comment/${button.dataset.commentId}/edit/`;
            editCommentModal.dataset.csrfToken = button.closest('.comment').querySelector('[name=csrfmiddlewaretoken]').value;
            document.getElementById('editCommentText').value = button.dataset.text;
            editCommentModal.style.display = 'flex';
        }
    });

    // Подтверждение удаления
    document.getElementById('confirmDeleteComment')?.addEventListener('click', async function() {
        try {
            const response = await fetch(deleteCommentModal.dataset.url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': deleteCommentModal.dataset.csrfToken
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                document.getElementById(`comment-${deleteCommentModal.dataset.commentId}`)?.remove();
                deleteCommentModal.style.display = 'none';
                
                document.querySelectorAll('.comments-title').forEach(el => {
                    el.innerHTML = `<i class="far fa-comments"></i> Комментарии (${data.comment_count})`;
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Подтверждение редактирования
    document.getElementById('confirmEditComment')?.addEventListener('click', async function() {
        const newText = document.getElementById('editCommentText').value;
        
        try {
            const response = await fetch(editCommentModal.dataset.url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': editCommentModal.dataset.csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `text=${encodeURIComponent(newText)}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                const commentElement = document.getElementById(`comment-${editCommentModal.dataset.commentId}`);
                if (commentElement) {
                    commentElement.querySelector('.comment-text').textContent = newText;
                    const editButton = commentElement.querySelector('.edit-comment-button');
                    if (editButton) editButton.dataset.text = newText;
                }
                editCommentModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Закрытие модальных окон
    document.querySelectorAll('.modal .close, .modal .action-button:not(.danger-button)').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});
