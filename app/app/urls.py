from django.contrib import admin
from django.urls import path
from main import views
from main.views import EmailLoginView, edit_profile
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.home, name="home"),
    path("register/", views.register, name="register"),
    path("login/", views.EmailLoginView.as_view(), name="login"),
    path("logout/", views.user_logout, name="logout"),
    path("profile/", views.profile, name="profile"),
    path("profile/edit/", views.edit_profile, name="edit_profile"),
    path("blog/", views.blog_list, name="blog"),
    path("blog/<int:post_id>/", views.blog_detail, name="blog_detail"),
    path("blog/create/", views.admin_blog_create, name="admin_blog_create"),
    path("blog/edit/<int:post_id>/", views.blog_edit, name="blog_edit"),
    path("blog/delete/<int:post_id>/", views.blog_delete, name="blog_delete"),
    path("blog/like/<int:post_id>/", views.like_blog, name="like_blog"),
    path("blog/comment/<int:post_id>/", views.add_comment, name="add_comment"),
    path("comment/like/<int:comment_id>/", views.like_comment, name="like_comment"),
    path("comment/edit/<int:comment_id>/", views.edit_comment, name="edit_comment"),
    path("comment/delete/<int:comment_id>/", views.delete_comment, name="delete_comment"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
