// Expandable property cards
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.card-header').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.card');
            const expanded = card.classList.toggle('open');
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
    });

    // Optional: auto-open first card in each group on desktop for discoverability
    // (kept collapsed by default to match the concise spec)

    // Citation copy
    const copyBtn = document.getElementById('copyCitationBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = document.getElementById('citationText').innerText;
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch(e) {}
            document.body.removeChild(ta);
            copyBtn.classList.add('copied');
            const original = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(() => { copyBtn.innerHTML = original; copyBtn.classList.remove('copied'); }, 1500);
        });
    }

    // Collapse long user/assistant messages with Read more / Read less toggle
    const COLLAPSE_THRESHOLD_PX = 240;
    document.querySelectorAll('.turn.assistant .bubble, .turn.user .bubble').forEach(bubble => {
        if (bubble.scrollHeight <= COLLAPSE_THRESHOLD_PX + 40) return;

        bubble.classList.add('collapsible', 'collapsed');

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'read-more-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<span class="label">Read more</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

        toggle.addEventListener('click', () => {
            const expanded = bubble.classList.toggle('collapsed') === false;
            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            toggle.querySelector('.label').textContent = expanded ? 'Read less' : 'Read more';
            if (!expanded) {
                bubble.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });

        bubble.insertAdjacentElement('afterend', toggle);
    });

    // Explorer filter chips
    const chipContainer = document.querySelector('.explorer-controls');
    if (chipContainer) {
        chipContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            chipContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const filter = chip.dataset.filter;
            document.querySelectorAll('.example-card').forEach(card => {
                if (filter === 'all' || card.dataset.topic === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
            document.querySelectorAll('.toc-group').forEach(group => {
                if (filter === 'all' || group.dataset.topic === filter) {
                    group.style.display = '';
                } else {
                    group.style.display = 'none';
                }
            });
        });
    }

    // TOC: highlight currently visible conversation
    const tocLinks = Array.from(document.querySelectorAll('.toc-link'));
    if (tocLinks.length) {
        const linkById = new Map();
        tocLinks.forEach(a => {
            const id = a.getAttribute('href').slice(1);
            linkById.set(id, a);
        });

        const setActive = (id) => {
            tocLinks.forEach(a => a.classList.remove('active'));
            const link = linkById.get(id);
            if (link) {
                link.classList.add('active');
                const sidebar = document.querySelector('.toc-sidebar');
                if (sidebar) {
                    const linkRect = link.getBoundingClientRect();
                    const sideRect = sidebar.getBoundingClientRect();
                    if (linkRect.top < sideRect.top || linkRect.bottom > sideRect.bottom) {
                        link.scrollIntoView({ block: 'nearest' });
                    }
                }
            }
        };

        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible.length) {
                setActive(visible[0].target.id);
            }
        }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

        document.querySelectorAll('.example-card[id]').forEach(card => observer.observe(card));
    }
});
