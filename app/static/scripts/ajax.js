document.addEventListener('DOMContentLoaded', () => {
    // Обработка кликов по формам лайков
    document.querySelectorAll('.like-form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const url = form.action;
            const formData = new FormData(form);
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                // Обновляем счётчик лайков
                const likeCountElem = form.querySelector('.like-count');
                likeCountElem.textContent = data.like_count;
                // Обновляем класс кнопки
                const likeButton = form.querySelector('.like-button');
                if (data.liked) {
                    likeButton.classList.add('liked');
                } else {
                    likeButton.classList.remove('liked');
                }
            })
            .catch(error => console.error('Ошибка:', error));
        });
    });

    // Обработка отправки комментариев
    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const url = form.action;
            const formData = new FormData(form);
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if(data.error){
                    console.error(data.error);
                    return;
                }
                // Добавляем новый комментарий в конец списка
                const commentsContainer = form.closest('.comments-section').querySelector('.existing-comments');
                const newCommentHTML = `
                    <div class="comment">
                    <img src="${data.avatar_url}" alt="${data.author}" class="comment-avatar">
                    <div class="comment-info">
                        <span class="comment-author">${data.author}</span>
                        <span class="comment-date">${data.date}</span>
                        <p class="comment-text">${data.text}</p>
                    </div>
                    </div>`;
                    
                commentsContainer.insertAdjacentHTML('beforeend', newCommentHTML);
                // Обновляем счётчик комментариев
                form.reset();
            })
            .catch(error => console.error('Ошибка:', error));
        });
    });
});

document.addEventListener('click', (e) => {
    const likeCommentButton = e.target.closest('.like-comment-button');
    if (likeCommentButton) {
        const commentId = likeCommentButton.dataset.commentId;
        fetch(`/comment/like/${commentId}/`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
        })
        .then(response => response.json())
        .then(data => {
            likeCommentButton.querySelector('.comment-like-count').textContent = data.like_count;
            if (data.liked) {
                likeCommentButton.classList.add('liked');
            } else {
                likeCommentButton.classList.remove('liked');
            }
        })
        .catch(error => console.error('Ошибка:', error));
    }
  });
  
  