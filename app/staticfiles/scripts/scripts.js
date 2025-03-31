document.addEventListener('DOMContentLoaded', () => {
    // Обработка кликов по кнопкам комментариев
// Add to your scripts.js
document.getElementById('commentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    fetch(this.action, {
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
            alert(data.error);
            return;
        }
        
        // Handle successful comment addition
        const commentsSection = document.querySelector('.existing-comments');
        if (commentsSection.querySelector('.no-comments')) {
            commentsSection.innerHTML = '';
        }
        
        // Create and append new comment
        const newComment = document.createElement('div');
        newComment.className = 'comment';
        newComment.id = `comment-${data.comment_id}`;
        newComment.innerHTML = `
            <!-- Your comment HTML structure here -->
        `;
        
        commentsSection.prepend(newComment);
        this.querySelector('textarea').value = '';
        
        // Update comment count
        document.querySelectorAll('.comments-title').forEach(el => {
            el.innerHTML = `<i class="far fa-comments"></i> Комментарии (${data.comment_count})`;
        });
    })
    .catch(error => console.error('Error:', error));
});
});

document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
      const slides = slider.querySelectorAll('.slide');
      let currentIndex = 0;
      setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
      }, 3000); // смена слайда каждые 3 секунды
    });
});

// Превью изображения
const imageInput = document.getElementById('id_image');
if (imageInput) {
    imageInput.addEventListener('change', function(e) {    const preview = document.getElementById('imagePreview');
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.add('visible');
        }
        reader.readAsDataURL(this.files[0]);
    }
});
}

document.getElementById('id_avatar').addEventListener('change', function(e) {
    const preview = document.getElementById('avatarPreview');
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (preview.tagName === 'IMG') {
                preview.src = e.target.result;
            } else {
                const img = document.createElement('img');
                img.id = 'avatarPreview';
                img.src = e.target.result;
                preview.replaceWith(img);
                preview = img;
            }
        }
        reader.readAsDataURL(this.files[0]);
    }
});

document.getElementById('avatar-clear-id').addEventListener('change', function(e) {
    const preview = document.getElementById('avatarPreview');
    if (this.checked) {
        if (preview.tagName === 'IMG') {
            const icon = document.createElement('i');
            icon.className = 'fas fa-user-circle';
            icon.id = 'avatarPreview';
            preview.replaceWith(icon);
        }
    }
});