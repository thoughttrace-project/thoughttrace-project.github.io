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

    // Explorer: show only one conversation at a time, controlled by TOC + chips
    const chipContainer = document.querySelector('.explorer-controls');
    const tocLinks = Array.from(document.querySelectorAll('.toc-link'));
    const cards = Array.from(document.querySelectorAll('.example-card[id]'));

    if (cards.length) {
        const linkById = new Map();
        tocLinks.forEach(a => linkById.set(a.getAttribute('href').slice(1), a));

        const showCard = (id) => {
            let target = null;
            cards.forEach(card => {
                if (card.id === id) {
                    card.style.display = '';
                    target = card;
                } else {
                    card.style.display = 'none';
                }
            });
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
            return target;
        };

        const firstVisibleIdForFilter = (filter) => {
            const match = cards.find(c => filter === 'all' || c.dataset.topic === filter);
            return match ? match.id : null;
        };

        // TOC link: switch to that conversation
        tocLinks.forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const id = a.getAttribute('href').slice(1);
                const target = showCard(id);
                history.replaceState(null, '', '#' + id);
                if (target) {
                    const top = target.getBoundingClientRect().top + window.scrollY - 16;
                    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
                }
            });
        });

        // Chip filter: limit which TOC entries appear, then show first matching card
        if (chipContainer) {
            chipContainer.addEventListener('click', (e) => {
                const chip = e.target.closest('.chip');
                if (!chip) return;
                chipContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const filter = chip.dataset.filter;
                document.querySelectorAll('.toc-group').forEach(group => {
                    group.style.display = (filter === 'all' || group.dataset.topic === filter) ? '' : 'none';
                });
                const id = firstVisibleIdForFilter(filter);
                if (id) {
                    showCard(id);
                    history.replaceState(null, '', '#' + id);
                }
            });
        }

        // Initial state: honor URL hash if it points to a known card; else show the first one
        const initialId = (() => {
            const hash = window.location.hash.replace(/^#/, '');
            if (hash && linkById.has(hash)) return hash;
            return cards[0].id;
        })();
        showCard(initialId);

        // Browser back/forward navigation: update displayed card to match hash
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace(/^#/, '');
            if (hash && linkById.has(hash)) showCard(hash);
        });
    }
});
