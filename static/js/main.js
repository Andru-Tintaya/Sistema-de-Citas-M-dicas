document.addEventListener('DOMContentLoaded', function() {
    // ===== 1. BUSCADOR Y FILTROS EN TIEMPO REAL =====
    const searchInput = document.getElementById('searchCita');
    const filterEspecie = document.getElementById('filterEspecie');
    const cards = document.querySelectorAll('.card-item');
    const grid = document.getElementById('appointmentsGrid');

    function filterCards() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const especieFilter = filterEspecie ? filterEspecie.value.toLowerCase() : '';

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const especie = card.dataset.especie.toLowerCase();
            
            const matchesSearch = text.includes(searchTerm);
            const matchesEspecie = !especieFilter || especie.includes(especieFilter);
            
            if (matchesSearch && matchesEspecie) {
                card.style.display = 'block';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                // Animación de entrada
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.display = 'none';
            }
        });

        // Mostrar mensaje si no hay resultados
        const visibleCards = Array.from(cards).filter(c => c.style.display !== 'none');
        if (visibleCards.length === 0 && cards.length > 0) {
            showNoResults();
        } else {
            hideNoResults();
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterCards, 300));
    }

    if (filterEspecie) {
        filterEspecie.addEventListener('change', filterCards);
    }

    // Limpiar filtros
    window.clearFilters = function() {
        if (searchInput) searchInput.value = '';
        if (filterEspecie) filterEspecie.value = '';
        filterCards();
    };

    // ===== 2. VALIDACIÓN DE FECHAS =====
    const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
    dateInputs.forEach(input => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1); // Mínimo 1 minuto en el futuro
        input.min = now.toISOString().slice(0, 16);
        
        input.addEventListener('change', function() {
            if (new Date(this.value) < now) {
                this.setCustomValidity('La fecha no puede ser en el pasado');
                this.style.borderColor = '#f56565';
            } else {
                this.setCustomValidity('');
                this.style.borderColor = '#48bb78';
            }
        });
    });

    // ===== 3. VALIDACIÓN DE FORMULARIOS =====
    const forms = document.querySelectorAll('#appointmentForm, #editForm');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const mascota = this.querySelector('input[name="mascota"]').value.trim();
            const propietario = this.querySelector('input[name="propietario"]').value.trim();
            const especie = this.querySelector('select[name="especie"]').value;
            const fecha = this.querySelector('input[name="fecha"]').value;

            if (!mascota || !propietario || !especie || !fecha) {
                e.preventDefault();
                showAlert('Por favor completa todos los campos requeridos', 'warning');
                return false;
            }

            // Éxito - mostrar loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2 spinner-border spinner-border-sm"></i>Guardando...';
            submitBtn.disabled = true;
        });
    });

    // ===== 4. ANIMACIONES DE CARGA =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.appointment-card, .card, .hero-header').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(el);
    });

    // ===== 5. ALERTAS PERSONALIZADAS =====
    window.showAlert = function(message, type = 'success') {
        // Remover alerta anterior
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) existingAlert.remove();

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} custom-alert shadow-lg position-fixed`;
        alert.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-${type === 'warning' ? 'exclamation-triangle-fill' : 'check-circle-fill'} me-3 fs-4"></i>
                <div>${message}</div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alert.style.cssText = `
            top: 120px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            border-radius: 20px;
            border: none;
            transform: translateX(400px);
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            backdrop-filter: blur(20px);
        `;
        
        document.body.appendChild(alert);
        
        // Animación de entrada
        requestAnimationFrame(() => {
            alert.style.transform = 'translateX(0)';
        });
        
        // Auto eliminar
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (alert.parentNode) alert.remove();
                }, 400);
            }
        }, 4000);
    };

    // ===== 6. EFECTOS VISUALES =====
    // Ripple effect en botones
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255,255,255,0.6);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // ===== UTILIDADES =====
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function showNoResults() {
        let noResults = document.querySelector('.no-results');
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.className = 'no-results col-12 text-center py-5';
            noResults.innerHTML = `
                <i class="bi bi-search text-muted mb-4" style="font-size: 4rem;"></i>
                <h4 class="text-muted mb-3">No se encontraron resultados</h4>
                <p class="text-muted mb-4">Intenta ajustar los filtros de búsqueda</p>
                <button class="btn btn-outline-primary" onclick="clearFilters()">Limpiar filtros</button>
            `;
            grid.appendChild(noResults);
        }
    }

    function hideNoResults() {
        const noResults = document.querySelector('.no-results');
        if (noResults) noResults.remove();
    }

    // ===== CSS ANIMACIÓN RIPPLE =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// ===== SMOOTH SCROLL PARA NAVBAR =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});