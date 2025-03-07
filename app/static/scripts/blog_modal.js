document.addEventListener('DOMContentLoaded', () => {
  // --- Модальное окно для удаления блога ---
  const blogModal = document.getElementById('deleteBlogModal');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  const cancelDeleteBtn = document.getElementById('cancelDelete');
  const blogCloseBtn = blogModal.querySelector('.close');
  let currentDeleteBlogUrl = '';

  document.querySelectorAll('.delete-blog-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      currentDeleteBlogUrl = button.getAttribute('data-url');
      blogModal.style.display = 'flex';
    });
  });

  confirmDeleteBtn.addEventListener('click', () => {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = currentDeleteBlogUrl;
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);
    document.body.appendChild(form);
    form.submit();
  });

  cancelDeleteBtn.addEventListener('click', () => {
    blogModal.style.display = 'none';
  });

  blogCloseBtn.addEventListener('click', () => {
    blogModal.style.display = 'none';
  });

  // --- Модальное окно для удаления комментария ---
  const deleteCommentModal = document.getElementById('deleteCommentModal');
  const confirmDeleteCommentBtn = document.getElementById('confirmDeleteComment');
  const cancelDeleteCommentBtn = document.getElementById('cancelDeleteComment');
  const deleteCommentCloseBtn = deleteCommentModal.querySelector('.close');
  let currentDeleteCommentUrl = '';

  document.querySelectorAll('.delete-comment-modal-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      currentDeleteCommentUrl = button.getAttribute('data-url');
      deleteCommentModal.style.display = 'flex';
    });
  });

  confirmDeleteCommentBtn.addEventListener('click', () => {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = currentDeleteCommentUrl;
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);
    document.body.appendChild(form);
    form.submit();
  });

  cancelDeleteCommentBtn.addEventListener('click', () => {
    deleteCommentModal.style.display = 'none';
  });

  deleteCommentCloseBtn.addEventListener('click', () => {
    deleteCommentModal.style.display = 'none';
  });

  // --- Модальное окно для редактирования комментария ---
  const editCommentModal = document.getElementById('editCommentModal');
  const confirmEditCommentBtn = document.getElementById('confirmEditComment');
  const cancelEditCommentBtn = document.getElementById('cancelEditComment');
  const editCommentCloseBtn = editCommentModal.querySelector('.close');
  const editCommentTextArea = document.getElementById('editCommentText');
  let currentEditCommentUrl = '';

  document.querySelectorAll('.edit-comment-modal-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      currentEditCommentUrl = button.getAttribute('data-url');
      editCommentTextArea.value = button.getAttribute('data-comment-text');
      editCommentModal.style.display = 'flex';
    });
  });

  confirmEditCommentBtn.addEventListener('click', () => {
    fetch(currentEditCommentUrl, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ comment: editCommentTextArea.value })
    })
      .then(response => response.json())
      .then(data => {
        const commentElem = document.getElementById(`comment-${data.comment_id}`);
        if (commentElem) {
          commentElem.querySelector('.comment-text').textContent = data.text;
        }
        editCommentModal.style.display = 'none';
      })
      .catch(error => console.error('Ошибка:', error));
  });

  cancelEditCommentBtn.addEventListener('click', () => {
    editCommentModal.style.display = 'none';
  });

  editCommentCloseBtn.addEventListener('click', () => {
    editCommentModal.style.display = 'none';
  });

  // --- Закрытие модальных окон при клике на фон (если клик вне modal-content) ---
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (!e.target.closest('.modal-content')) {
        modal.style.display = 'none';
      }
    });
  });
});
