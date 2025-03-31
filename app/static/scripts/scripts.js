document.addEventListener('DOMContentLoaded', () => {
    // Инициализация мобильного меню
    const initMobileMenu = () => {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mainNav = document.querySelector('.main-nav');
        const body = document.body;
        
        const toggleMenu = (state) => {
            const isActive = state !== undefined ? state : !mainNav.classList.contains('active');
            
            mainNav.classList.toggle('active', isActive);
            mobileMenuBtn.classList.toggle('active', isActive);
            body.classList.toggle('menu-open', isActive);
            
            // Блокировка скролла
            if (isActive) {
                document.documentElement.style.overflow = 'hidden';
            } else {
                document.documentElement.style.removeProperty('overflow');
            }
        };
    
        // Обработчик клика по кнопке
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    
        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                toggleMenu(false);
            }
        });
    
        // Закрытие при ресайзе
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                toggleMenu(false);
            }
        }, { passive: true });
    
        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                toggleMenu(false);
            }
        });
    };

    // Общая функция для обработки лайков
    const initLikeForms = (selector, buttonClass, countClass) => {
        document.querySelectorAll(selector).forEach(form => {
            form.addEventListener('submit', function(e) {
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
                    if (data.error) return alert(data.error);
                    
                    const likeButton = this.querySelector(buttonClass);
                    const likeCount = this.querySelector(countClass);
                    const icon = likeButton.querySelector('i');

                    likeButton.classList.toggle('liked', data.liked);
                    icon.classList.toggle('far', !data.liked);
                    icon.classList.toggle('fas', data.liked);
                    if (likeCount) likeCount.textContent = data.like_count;
                })
                .catch(error => console.error('Error:', error));
            });
        });
    };

    // Инициализация слайдеров
    const initSliders = () => {
        document.querySelectorAll('.slider').forEach(slider => {
            const slides = slider.querySelectorAll('.slide');
            let currentIndex = 0;
            
            if (slides.length > 0) {
                setInterval(() => {
                    slides[currentIndex].classList.remove('active');
                    currentIndex = (currentIndex + 1) % slides.length;
                    slides[currentIndex].classList.add('active');
                }, 3000);
            }
        });
    };

    // Обработчик загрузки изображений
    const initImageUpload = (inputId, previewId, isAvatar = false) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('change', function(e) {
            const preview = document.getElementById(previewId);
            if (!preview || !this.files?.[0]) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                if (isAvatar && preview.tagName !== 'IMG') {
                    const img = document.createElement('img');
                    img.id = previewId;
                    img.src = e.target.result;
                    preview.replaceWith(img);
                } else {
                    preview.src = e.target.result;
                    preview.classList.add('visible');
                }
            };
            reader.readAsDataURL(this.files[0]);
        });
    };

    // Обработчик очистки аватара
    const initAvatarClear = () => {
        const clearCheckbox = document.getElementById('avatar-clear-id');
        if (!clearCheckbox) return;

        clearCheckbox.addEventListener('change', function(e) {
            const preview = document.getElementById('avatarPreview');
            if (!preview || !this.checked) return;

            if (preview.tagName === 'IMG') {
                const icon = document.createElement('i');
                icon.className = 'fas fa-user-circle';
                icon.id = 'avatarPreview';
                preview.replaceWith(icon);
            }
        });
    };

    // Обработчик комментариев
    const initCommentForm = () => {
        const commentForm = document.getElementById('commentForm');
        if (!commentForm) return;

        commentForm.addEventListener('submit', function(e) {
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
                if (data.error) return alert(data.error);
                
                const commentsSection = document.querySelector('.existing-comments');
                if (commentsSection?.querySelector('.no-comments')) {
                    commentsSection.innerHTML = '';
                }

                const newComment = document.createElement('div');
                newComment.className = 'comment';
                newComment.id = `comment-${data.comment_id}`;

                commentsSection?.prepend(newComment);
                this.querySelector('textarea').value = '';

                document.querySelectorAll('.comments-title').forEach(el => {
                    el.innerHTML = `<i class="far fa-comments"></i> Комментарии (${data.comment_count})`;
                });
            })
            .catch(error => console.error('Error:', error));
        });
    };

    // Инициализация всех компонентов
    initMobileMenu();
    initSliders();
    initCommentForm();
    initLikeForms('.like-form', '.like-button', '.like-count');
    initLikeForms('.like-comment-form', '.like-comment-button', '.comment-like-count');
    initImageUpload('id_image', 'imagePreview');
    initImageUpload('id_avatar', 'avatarPreview', true);
    initAvatarClear();
});