document.addEventListener('DOMContentLoaded', () => {
    // --- Модальное окно для удаления блога (уже реализовано) ---
    const blogModal = document.getElementById('deleteBlogModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const blogCloseBtn = document.querySelector('#deleteBlogModal .close');
    let currentDeleteBlogUrl = '';
    
    document.querySelectorAll('.delete-blog-button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        currentDeleteBlogUrl = button.getAttribute('data-url');
        blogModal.style.display = 'block';
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
    
    window.addEventListener('click', (e) => {
      if (e.target === blogModal) {
        blogModal.style.display = 'none';
      }
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
        deleteCommentModal.style.display = 'block';
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
        // Предварительно заполнить текст комментария
        editCommentTextArea.value = button.getAttribute('data-comment-text');
        editCommentModal.style.display = 'block';
      });
    });
    
    confirmEditCommentBtn.addEventListener('click', () => {
      const form = document.createElement('form');
      form.method = 'post';
      form.action = currentEditCommentUrl;
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrfmiddlewaretoken';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
      const commentInput = document.createElement('input');
      commentInput.type = 'hidden';
      commentInput.name = 'comment';
      commentInput.value = editCommentTextArea.value;
      form.appendChild(commentInput);
      document.body.appendChild(form);
      form.submit();
    });
    
    cancelEditCommentBtn.addEventListener('click', () => {
      editCommentModal.style.display = 'none';
    });
    
    editCommentCloseBtn.addEventListener('click', () => {
      editCommentModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
      if (e.target === editCommentModal) {
        editCommentModal.style.display = 'none';
      }
    });
  });
  