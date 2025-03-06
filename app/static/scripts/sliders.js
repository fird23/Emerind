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