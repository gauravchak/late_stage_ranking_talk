document.addEventListener('DOMContentLoaded', () => {
  // === KATEX AUTO-RENDER ===
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ]
    });
  }

  // === SLIDE NAVIGATION SYSTEM ===
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const progressFill = document.querySelector('.progress-bar-fill');
  const progressText = document.querySelector('.progress-text');
  const breadcrumbSteps = Array.from(document.querySelectorAll('.breadcrumb-step'));
  
  let currentSlideIndex = 0;
  
  function updateBreadcrumbs(slideNum) {
    breadcrumbSteps.forEach(step => {
      const range = step.getAttribute('data-range').split(',').map(Number);
      if (slideNum >= range[0] && slideNum <= range[1]) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  function updateSlides() {
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev');
      if (index === currentSlideIndex) {
        slide.classList.add('active');
      } else if (index < currentSlideIndex) {
        slide.classList.add('prev');
      }
    });
    
    // Update progress bar
    if (slides.length > 1) {
      const progressPercent = (currentSlideIndex / (slides.length - 1)) * 100;
      progressFill.style.width = `${progressPercent}%`;
    } else {
      progressFill.style.width = '100%';
    }
    progressText.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
    
    // Update breadcrumbs highlight
    updateBreadcrumbs(currentSlideIndex + 1);

    // Enable/disable buttons
    if (prevBtn) prevBtn.disabled = currentSlideIndex === 0;
    if (nextBtn) nextBtn.disabled = currentSlideIndex === slides.length - 1;

    // Reset playground position on entering Slide 5
    if (currentSlideIndex === 4) {
      resetPlayground();
    }
  }
  
  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      updateSlides();
    }
  }
  
  function prevSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      updateSlides();
    }
  }
  
  // Event Listeners
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  
  const restartBtn = document.getElementById('btn-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentSlideIndex = 0;
      updateSlides();
    });
  }
  
  document.addEventListener('keydown', (e) => {
    // Check if the user is typing in an input/textarea/select
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.tagName === 'SELECT') {
      return;
    }
    
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Home') {
      e.preventDefault();
      currentSlideIndex = 0;
      updateSlides();
    } else if (e.key === 'End') {
      e.preventDefault();
      currentSlideIndex = slides.length - 1;
      updateSlides();
    }
  });

  // Touch navigation (swipe)
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const threshold = 50;
    if (touchEndX < touchStartX - threshold) {
      nextSlide();
    } else if (touchEndX > touchStartX + threshold) {
      prevSlide();
    }
  }

  // === INTERACTIVE GRADIENT PLAYGROUND (Slide 05) ===
  const btnPointwise = document.getElementById('btn-mode-pointwise');
  const btnPairwise = document.getElementById('btn-mode-pairwise');
  const btnApplyGradient = document.getElementById('btn-apply-gradient');
  const itemA = document.getElementById('item-a');
  const itemC = document.getElementById('item-c');
  const playDesc = document.getElementById('playground-desc');
  
  let currentMode = 'pointwise';
  
  if (btnPointwise && btnPairwise && btnApplyGradient) {
    btnPointwise.addEventListener('click', () => {
      currentMode = 'pointwise';
      btnPointwise.classList.add('active');
      btnPairwise.classList.remove('active');
      playDesc.textContent = "Pointwise fits labels directly: negative item Neg B is pulled to 0.0, positive item Pos A to 1.0, regardless of context.";
      resetPlayground();
    });
    
    btnPairwise.addEventListener('click', () => {
      currentMode = 'pairwise';
      btnPairwise.classList.add('active');
      btnPointwise.classList.remove('active');
      playDesc.textContent = "Pairwise optimizes relative order: it pushes positive item Pos A above negative item Neg B, focusing on correct sequence rather than absolute score targets.";
      resetPlayground();
    });
    
    btnApplyGradient.addEventListener('click', () => {
      // Toggle arrows active state
      document.querySelectorAll('.gradient-arrow').forEach(arrow => arrow.classList.add('active'));
      
      if (currentMode === 'pointwise') {
        // Pointwise: target positions are absolute (positives at 1.0, negatives at 0.0)
        if (itemA) itemA.style.top = '15%';
        if (itemC) itemC.style.top = '85%';
      } else {
        // Pairwise: target positions are relative (positives above negatives)
        if (itemA) itemA.style.top = '30%';
        if (itemC) itemC.style.top = '70%';
      }
      
      setTimeout(() => {
        document.querySelectorAll('.gradient-arrow').forEach(arrow => arrow.classList.remove('active'));
      }, 1500);
    });
  }
  
  function resetPlayground() {
    if (itemA && itemC) {
      itemA.style.top = '60%'; // Pos A starts lower
      itemC.style.top = '40%'; // Neg B starts higher
    }
  }

  // === INTERACTIVE TARGET ATTENTION (Slide 17) ===
  const selectQueryItem = document.getElementById('select-query-item');
  const btnRunAttention = document.getElementById('btn-run-attention');
  const weight1 = document.getElementById('weight-1');
  const weight2 = document.getElementById('weight-2');
  const weight3 = document.getElementById('weight-3');
  const weight4 = document.getElementById('weight-4');
  const event1 = document.getElementById('event-1');
  const event2 = document.getElementById('event-2');
  const event3 = document.getElementById('event-3');
  const event4 = document.getElementById('event-4');
  
  if (event4) event4.classList.add('masked-step');
  
  if (btnRunAttention) {
    btnRunAttention.addEventListener('click', () => {
      const selected = selectQueryItem.value;
      
      // Reset matching card classes and show calculating
      [event1, event2, event3].forEach(evt => {
        if (evt) evt.classList.remove('active-match');
      });
      [weight1, weight2, weight3].forEach(w => {
        if (w) w.textContent = "Calculating...";
      });
      
      setTimeout(() => {
        if (selected === 'headphones') {
          // Headphones: match Laptop (electronics/music connection: high), Movie (med), Gym Shorts (low)
          if (weight1) weight1.textContent = "0.72";
          if (weight2) weight2.textContent = "0.21";
          if (weight3) weight3.textContent = "0.07";
          
          if (event1) event1.classList.add('active-match');
          if (event2) event2.classList.add('active-match');
        } else {
          // Sneakers: match Laptop (low), Movie (med), Gym Shorts (apparel/sports: high)
          if (weight1) weight1.textContent = "0.05";
          if (weight2) weight2.textContent = "0.15";
          if (weight3) weight3.textContent = "0.80";
          
          if (event3) event3.classList.add('active-match');
          if (event2) event2.classList.add('active-match');
        }
      }, 800);
    });
  }

  // Initialize slides
  updateSlides();
});
