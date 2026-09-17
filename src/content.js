const RATING_BADGE_ATTR = 'data-rmp-processed';

function extractLastName(rawText) {
    if (!rawText) {
        return null;
    }
    const [lastName] = rawText.split(',');
    return lastName ? lastName.trim() : null;
}

function formatBadgeText(response) {
    if (!response) {
        return 'RMP: no response';
    }
    if (response.error) {
        return `RMP: ${response.error}`;
    }
    const rating = response.avgRating != null ? response.avgRating.toFixed(1) : '?';
    const numRatings = response.numRatings != null ? response.numRatings : 0;
    return `RMP: ${rating}/5 (${numRatings})`;
}

function injectBadge(cell, text) {
    const badge = document.createElement('span');
    badge.className = 'rmp-rating-badge';
    badge.textContent = text;
    cell.appendChild(badge);
}

function handleInstructorCell(cell) {
    if (!cell || cell.hasAttribute(RATING_BADGE_ATTR)) {
        return;
    }
    cell.setAttribute(RATING_BADGE_ATTR, 'true');

    const lastName = extractLastName(cell.textContent);
    if (!lastName) {
        return;
    }

    const dataId = cell.getAttribute('data-id') ?? cell.closest('[data-id]')?.getAttribute('data-id') ?? null;

    chrome.runtime.sendMessage({ instructorName: lastName, id: dataId }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn('RMP extension: message failed', chrome.runtime.lastError.message);
            return;
        }
        injectBadge(cell, formatBadgeText(response));
    });
}

function scanNodeForInstructorCells(node) {
    if (!(node instanceof Element)) {
        return;
    }

    if (node.matches?.('[data-property="instructor"]')) {
        handleInstructorCell(node);
    }

    node.querySelectorAll?.('[data-property="instructor"]').forEach(handleInstructorCell);
}

function startObserving() {
    const observer = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
            if (mutation.type !== 'childList') {
                continue;
            }
            for (const node of mutation.addedNodes) {
                scanNodeForInstructorCells(node);
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
    if (enabled) {
        startObserving();
    }
});
