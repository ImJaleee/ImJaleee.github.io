// Config Google Apps Script Web App URL here
const SCRIPT_URL = ''; // FILL THIS WITH APPS SCRIPT WEB APP URL

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('commentsList');
    const form = document.getElementById('commentForm');
    if (!listContainer || !form) return;

    // Initial load
    if (SCRIPT_URL) {
        fetchComments();
    } else {
        listContainer.innerHTML = '<div class="loading-text" style="color:#ef4444;">Please set the Google Apps Script URL in js/comments.js to enable comments.</div>';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!SCRIPT_URL) {
            alert('Comments system is not configured yet.');
            return;
        }

        const name = document.getElementById('commentName').value;
        const msg = document.getElementById('commentMsg').value;
        const btn = document.getElementById('submitCommentBtn');

        btn.disabled = true;
        btn.textContent = 'Posting...';

        try {
            // Using POST to Apps Script normally faces CORS issues if not setup correctly.
            // A common workaround is using mode: 'no-cors' or sending a simple GET with query params.
            // For robust implementation, JSONP or CORS enabled POST is needed. 
            // Assuming the script is configured to accept POST with standard CORS headers or we use formData.

            const formData = new FormData();
            formData.append('name', name);
            formData.append('message', msg);
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            // Reset form
            form.reset();
            
            // Optimistically add comment
            addCommentToList({
                name: name,
                message: msg,
                timestamp: new Date().toISOString(),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            });

        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment. Check console for details.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Post Comment';
        }
    });

    async function fetchComments() {
        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) throw new Error('Fetch failed');
            const data = await response.json();
            
            listContainer.innerHTML = '';
            if (data.length === 0) {
                listContainer.innerHTML = '<div class="loading-text">Be the first to comment!</div>';
                return;
            }

            data.forEach(comment => addCommentToList(comment, true));
            scrollToBottom();

        } catch (error) {
            console.error('Error fetching comments:', error);
            listContainer.innerHTML = '<div class="loading-text" style="color:#ef4444;">Error loading comments or CORS issue. Please check configuration.</div>';
        }
    }

    function addCommentToList(comment, append = false) {
        const item = document.createElement('div');
        item.className = 'comment-item';
        
        // Format timestamp nicely
        let timeStr = 'Just now';
        if (comment.timestamp) {
            const date = new Date(comment.timestamp);
            if (!isNaN(date.getTime())) {
                timeStr = date.toLocaleString();
            }
        }

        item.innerHTML = `
            <div class="comment-header">
                <span class="comment-name">${escapeHtml(comment.name)}</span>
                <span class="comment-time">${escapeHtml(timeStr)}</span>
            </div>
            <div class="comment-body">${escapeHtml(comment.message).replace(/\n/g, '<br>')}</div>
        `;

        if (append) {
            listContainer.appendChild(item);
        } else {
            // Optimistic append, remove "first to comment" label if exists
            if (listContainer.querySelector('.loading-text')) {
                listContainer.innerHTML = '';
            }
            listContainer.appendChild(item);
            scrollToBottom();
        }
    }

    function scrollToBottom() {
        listContainer.scrollTop = listContainer.scrollHeight;
    }

    function escapeHtml(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
