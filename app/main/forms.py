from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms
from .models import CustomUser
from .models import BlogPost, BlogComment

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = ("username", "email", "password1", "password2", "avatar")

class EmailLoginForm(AuthenticationForm):
    username = forms.EmailField(
        label="Email",
        widget=forms.EmailInput(attrs={
            'placeholder': 'Введите email',
            'required': True,
            'id': 'id_username'
        })
    )
    
    def clean(self):
        email = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        
        if email and password:
            try:
                user_obj = CustomUser.objects.get(email=email)
                # Подставляем настоящий username вместо email, чтобы стандартный backend смог аутентифицировать пользователя
                self.cleaned_data['username'] = user_obj.username
            except CustomUser.DoesNotExist:
                raise forms.ValidationError("Пользователь с таким email не найден")
                
        return super().clean()

class ProfileUpdateForm(forms.ModelForm):
    # Дополнительные поля для смены пароля (не обязательны)
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Новый пароль'}),
        required=False,
        label="Новый пароль"
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Подтвердите пароль'}),
        required=False,
        label="Подтверждение пароля"
    )

    class Meta:
        model = CustomUser
        fields = ['avatar', 'username', 'email']
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Введите заголовок'}),
            'description': forms.Textarea(attrs={'placeholder': 'Введите описание'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get("password1")
        p2 = cleaned_data.get("password2")
        if p1 or p2:
            if p1 != p2:
                raise forms.ValidationError("Пароли не совпадают.")
        return cleaned_data

class BlogPostForm(forms.ModelForm):
    class Meta:
        model = BlogPost
        fields = ['title', 'description', 'image']
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Введите заголовок'}),
            'description': forms.Textarea(attrs={'placeholder': 'Введите описание'}),
        }

class BlogCommentForm(forms.ModelForm):
    class Meta:
        model = BlogComment
        fields = ['text']
        widgets = {
            'text': forms.Textarea(attrs={'placeholder': 'Напишите комментарий...', 'rows': 3}),
        }