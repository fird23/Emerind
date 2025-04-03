document.addEventListener('DOMContentLoaded', function() {
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Проверяем, начинается ли cookie с нужного имени
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

    const deleteCommentModal = document.getElementById('deleteCommentModal');
    const editCommentModal = document.getElementById('editCommentModal');
    
    // Обработчики для кнопок в комментариях
    document.addEventListener('click', function(e) {
    // Увеличение счетчика просмотров
    document.querySelectorAll('.blog-post h2 a').forEach(postLink => {
        postLink.addEventListener('click', async function(e) {
            const postId = this.href.split('/').pop(); // Получаем ID поста из URL
            try {
                const response = await fetch(`/increment_view_count/${postId}/`, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCookie('csrftoken') // Получаем CSRF токен
                    }
                });
                const data = await response.json();
                if (data.error) {
                    console.error(data.error);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
    
    // Удаление комментария
        if (e.target.closest('.delete-comment-button')) {
            e.preventDefault();
            const button = e.target.closest('.delete-comment-button');
            deleteCommentModal.dataset.commentId = button.dataset.commentId;
            deleteCommentModal.dataset.url = button.closest('form').action || `/comment/${button.dataset.commentId}/delete/`;
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
    
    // Подтверждение удаления комментария
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
                
                // Обновляем счетчик комментариев
                document.querySelectorAll('.comments-title').forEach(el => {
                    el.innerHTML = `<i class="far fa-comments"></i> Комментарии (${data.comment_count})`;
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    
    // Подтверждение редактирования комментария
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
                    // Обновляем data-text в кнопке редактирования
                    const editButton = commentElement.querySelector('.edit-comment-button');
                    if (editButton) {
                        editButton.dataset.text = newText;
                    }
                }
                editCommentModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    
    // Функция для отправки комментария
    window.submitComment = async function(event) {
        event.preventDefault();
        const form = event.target;
        
        // Блокируем повторные отправки
        if (form.classList.contains('submitting')) return;
        form.classList.add('submitting');
        
        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData
            });
            
            if (!response.ok) throw new Error('Ошибка сервера');
            const data = await response.json();
            
            if (data.success) {
                const commentsContainer = document.querySelector('.existing-comments');
                
                const freshResponse = await fetch(`/blog/${form.dataset.postId}/comments/`);
                const freshHtml = await freshResponse.text();
                commentsContainer.innerHTML = freshHtml;
                                
                form.reset();
                document.querySelector('.comments-title').innerHTML = 
                    `<i class="far fa-comments"></i> Комментарии (${data.comment_count})`;
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        } finally {
            form.classList.remove('submitting');
        }
    };
    
    // Закрытие по клику вне модального окна
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    // Удаление поста
    function showDeletePostModal(url) {
        const modal = document.getElementById('deletePostModal');
        const form = document.getElementById('confirmDeletePostForm');
        form.action = url;
        modal.style.display = 'flex';
    }

    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-blog-button')) {
            e.preventDefault();
            const form = e.target.closest('form');
            showDeletePostModal(form.action);
        }
    });
});
