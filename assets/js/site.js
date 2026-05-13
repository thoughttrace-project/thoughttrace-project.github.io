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
        });
    }
});
