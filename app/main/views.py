from .models import CustomUser, BlogPost, BlogComment
from .forms import EmailLoginForm, ProfileUpdateForm, BlogPostForm, CustomUserCreationForm
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.views import LoginView
from django.http import JsonResponse
from django.templatetags.static import static
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # Кэшировать на 15 минут
def home(request):
    latest_blogs = BlogPost.objects.order_by('-published_date')[:3]
    return render(request, "home.html", {"latest_blogs": latest_blogs})

@login_required
def increment_view_count(request, post_id):
    if request.user.is_authenticated:
        post = get_object_or_404(BlogPost, id=post_id)
        post.view_count += 1
        post.save()
        return JsonResponse({'view_count': post.view_count})
    return JsonResponse({'error': 'Not authenticated'}, status=403)
    
def home(request):
    latest_blogs = BlogPost.objects.order_by('-published_date')[:3]
    return render(request, "home.html", {"latest_blogs": latest_blogs})

def blog_list(request):
    posts = BlogPost.objects.order_by('-published_date')
    return render(request, "blog.html", {"posts": posts})


def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.avatar = 'avatars/avatar.jpg'
            user.save()
            login(request, user)
            return redirect("profile")
        else:
            messages.error(request, "Пожалуйста, исправьте ошибки в форме.")
    else:
        form = CustomUserCreationForm()
    return render(request, "register.html", {"form": form})

def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        try:
            user = CustomUser.objects.get(email=email)
            user = authenticate(request, username=user.username, password=password)
            if user:
                login(request, user)
                return redirect("profile")
            else:
                messages.error(request, "Неверный пароль")
        except CustomUser.DoesNotExist:
            messages.error(request, "Пользователь с таким email не найден")
    return render(request, "login.html")
    
class EmailLoginView(LoginView):
    authentication_form = EmailLoginForm
    template_name = "login.html"

@login_required
def profile(request):
    return render(request, "profile.html")

def user_logout(request):
    logout(request)
    return redirect("home")

@login_required
def edit_profile(request):
    if request.method == "POST":
        form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            user = form.save(commit=False)
            # Handle avatar removal
            if 'avatar-clear' in request.POST:
                user.avatar = 'avatars/avatar.jpg'
            new_password = form.cleaned_data.get("password1")
            if new_password:
                user.set_password(new_password)
            user.save()
            messages.success(request, "Профиль обновлен.")
            if new_password:
                login(request, user)
            return redirect("profile")
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = ProfileUpdateForm(instance=request.user)
    return render(request, "edit_profile.html", {"form": form})

@user_passes_test(lambda u: u.is_staff)
def admin_blog_create(request):
    if request.method == "POST":
        form = BlogPostForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()  # published_date устанавливается автоматически
            messages.success(request, "Блог успешно опубликован")
            return redirect("blog")
        else:
            messages.error(request, "Пожалуйста, исправьте ошибки в форме")
    else:
        form = BlogPostForm()
    return render(request, "blog_create.html", {"form": form})

def blog_detail(request, post_id):
    post = get_object_or_404(BlogPost.objects.prefetch_related('comments', 'comments__author', 'likes'), id=post_id)
    
    increment_view_count(request, post_id)
    return render(request, "blog_detail.html", {"post": post})

@user_passes_test(lambda u: u.is_staff)
def blog_edit(request, post_id):
    post = get_object_or_404(BlogPost, id=post_id)
    if request.method == "POST":
        form = BlogPostForm(request.POST, request.FILES, instance=post)
        if form.is_valid():
            form.save()
            messages.success(request, "Блог обновлен")
            return redirect("blog")
    else:
        form = BlogPostForm(instance=post)
    return render(request, "blog_edit.html", {"form": form, "post": post})

@user_passes_test(lambda u: u.is_staff)
def blog_delete(request, post_id):
    post = get_object_or_404(BlogPost, id=post_id)
    if request.method == "POST":
        post.delete()
        messages.success(request, "Блог удален")
        return redirect("blog")
    return render(request, "blog_delete_confirm.html", {"post": post})

@require_POST
def like_blog(request, post_id):
    if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    post = get_object_or_404(BlogPost, id=post_id)
    user = request.user
    
    if not user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=403)
    
    if user in post.likes.all():
        post.likes.remove(user)
        liked = False
    else:
        post.likes.add(user)
        liked = True
    
    return JsonResponse({
        'liked': liked,
        'like_count': post.likes.count()
    })

@login_required
@require_POST
def add_comment(request, post_id):
    post = get_object_or_404(BlogPost, id=post_id)
    text = request.POST.get('text', '').strip()
    
    if not text:
        return JsonResponse({'error': 'Текст комментария не может быть пустым'}, status=400)
    
    comment = BlogComment.objects.create(
        blog=post,
        author=request.user,
        text=text
    )
    
    avatar_url = request.user.avatar.url if request.user.avatar else static('avatars/avatar.jpg')
    
    return JsonResponse({
        'success': True,
        'comment_id': comment.id,
        'author': request.user.username,
        'avatar_url': avatar_url,
        'text': comment.text,
        'date': comment.created_at.strftime('%d.%m.%Y %H:%M'),
        'comment_count': post.comments.count(),
        'csrf_token': get_token(request)
    })

@require_POST
def like_comment(request, comment_id):
    if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    comment = get_object_or_404(BlogComment, id=comment_id)
    user = request.user
    
    if not user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=403)
    
    if user in comment.likes.all():
        comment.likes.remove(user)
        liked = False
    else:
        comment.likes.add(user)
        liked = True
        
    return JsonResponse({
        'liked': liked,
        'like_count': comment.likes.count()
    })

@login_required
@require_POST
def edit_comment(request, comment_id):
    comment = get_object_or_404(BlogComment, id=comment_id)
    if comment.author != request.user:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    text = request.POST.get('text', '').strip()
    if not text:
        return JsonResponse({'error': 'Comment text is required'}, status=400)
    
    comment.text = text
    comment.save()
    
    return JsonResponse({
        'success': True,
        'text': comment.text
    })

@login_required
@require_POST
def delete_comment(request, comment_id):
    comment = get_object_or_404(BlogComment, id=comment_id)
    if comment.author != request.user:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    post_id = comment.blog.id
    comment.delete()
    
    post = get_object_or_404(BlogPost, id=post_id)
    return JsonResponse({
        'success': True,
        'comment_count': post.comments.count()
    })