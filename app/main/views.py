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

@login_required
def like_blog(request, post_id):
    post = get_object_or_404(BlogPost, id=post_id)
    user = request.user
    if user in post.likes.all():
        post.likes.remove(user)
        liked = False
    else:
        post.likes.add(user)
        liked = True
    if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        return JsonResponse({
            'like_count': post.likes.count(),
            'liked': liked,
        })
    return redirect("blog")

@login_required
def add_comment(request, post_id):
    post = get_object_or_404(BlogPost, id=post_id)
    if request.method == "POST":
        comment_text = request.POST.get("comment")
        if comment_text:
            comment = BlogComment.objects.create(blog=post, author=request.user, text=comment_text)
            if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
                if request.user.avatar and request.user.avatar.name != 'avatars/avatar.jpg':
                    avatar_url = request.user.avatar.url
                else:
                    avatar_url = static('avatar.jpg')
                return JsonResponse({
                    'comment_id': comment.id,
                    'author': request.user.username,
                    'avatar_url': avatar_url,
                    'date': comment.created_at.strftime('%d.%m.%Y %H:%M'),
                    'text': comment.text,
                    'comment_count': post.comments.count(),
                    'post_id': post_id,
                    'is_author': True,  # так как автор комментария — текущий пользователь
                    'edit_url': reverse('edit_comment', args=[comment.id]),
                    'delete_url': reverse('delete_comment', args=[comment.id]),
                })
            messages.success(request, "Комментарий добавлен")
    return redirect("blog")


@login_required
def like_comment(request, comment_id):
    """
    Позволяет пользователям лайкать/снимать лайк с комментария.
    Если запрос AJAX – возвращаем JSON с новым количеством лайков и состоянием.
    """
    comment = get_object_or_404(BlogComment, id=comment_id)
    user = request.user
    if user in comment.likes.all():
        comment.likes.remove(user)
        liked = False
    else:
        comment.likes.add(user)
        liked = True

    if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        return JsonResponse({
            'like_count': comment.likes.count(),
            'liked': liked,
            'comment_id': comment.id,
        })
    return redirect("blog")


@login_required
def edit_comment(request, comment_id):
    """
    Позволяет автору комментария отредактировать свой комментарий.
    Если запрос AJAX – можно вернуть обновленный текст в формате JSON.
    """
    comment = get_object_or_404(BlogComment, id=comment_id)
    if comment.author != request.user:
        messages.error(request, "Вы не можете редактировать этот комментарий.")
        return redirect("blog")
    if request.method == "POST":
        new_text = request.POST.get("comment")
        if new_text:
            comment.text = new_text
            comment.save()
            if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
                return JsonResponse({
                    'text': comment.text,
                    'comment_id': comment.id,
                })
            messages.success(request, "Комментарий обновлен.")
            return redirect("blog")
        else:
            messages.error(request, "Комментарий не может быть пустым.")
    # Если GET – можно отобразить простую форму редактирования
    return render(request, "edit_comment.html", {"comment": comment})


@login_required
def delete_comment(request, comment_id):
    """
    Позволяет автору комментария удалить его.
    При AJAX-запросе возвращается JSON-ответ.
    """
    comment = get_object_or_404(BlogComment, id=comment_id)
    if comment.author != request.user:
        messages.error(request, "Вы не можете удалить этот комментарий.")
        return redirect("blog")
    if request.method == "POST":
        comment.delete()
        if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            return JsonResponse({'deleted': True, 'comment_id': comment_id})
        messages.success(request, "Комментарий удален.")
        return redirect("blog")
    return render(request, "delete_comment.html", {"comment": comment})
