document.addEventListener('DOMContentLoaded', function() {
    // Лайк поста
    document.addEventListener('click', function(e) {
        if (e.target.closest('.like-button')) {
            e.preventDefault();
            const button = e.target.closest('.like-button');
            const form = button.closest('.like-form');
            const formData = new FormData(form);
            
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
                if (data.error) {
                    console.error(data.error);
                    return;
                }
                
                const icon = button.querySelector('i');
                const count = button.querySelector('.like-count');
                
                button.classList.toggle('liked', data.liked);
                icon.classList.toggle('far', !data.liked);
                icon.classList.toggle('fas', data.liked);
                if (count) count.textContent = data.like_count;
            })
            .catch(error => console.error('Error:', error));
        }
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
