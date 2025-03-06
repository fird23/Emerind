from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class CustomUser(AbstractUser):
    avatar = models.ImageField(
        upload_to="avatars/",
        default="avatars/avatar.jpg",
        blank=True
    )

class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='blogs/', blank=True, null=True)
    published_date = models.DateTimeField(default=timezone.now)
    likes = models.ManyToManyField(CustomUser, related_name='liked_blogs', blank=True)

    def like_count(self):
        return self.likes.count()

    def comment_count(self):
        return self.comments.count()

    def __str__(self):
        return self.title

class BlogComment(models.Model):
    blog = models.ForeignKey(BlogPost, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Комментарий от {self.author.username} к {self.blog.title}'
