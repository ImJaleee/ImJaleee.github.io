// GitHub REST API Wrapper for client-side CRUD
const GitHubAPI = {
    owner: 'ImJaleee',
    repo: 'ImJaleee.github.io', 
    branch: 'main',
    
    // Fallback variable to check if token exists
    getToken() {
        return sessionStorage.getItem('gh_token');
    },

    setToken(token) {
        sessionStorage.setItem('gh_token', token);
    },

    clearToken() {
        sessionStorage.removeItem('gh_token');
    },

    getHeaders() {
        const token = this.getToken();
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        if (token) {
            headers['Authorization'] = `token ${token}`;
        }
        return headers;
    },

    // Fetch file content (JSON) and sha
    async getFile(path) {
        // First try to fetch from local if testing locally, 
        // but for admin CRUD to work properly, we need the SHA from GitHub.
        // We will directly query GitHub API.
        try {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;
            const response = await fetch(url, { headers: this.getHeaders() });
            
            if (!response.ok) {
                if (response.status === 404) {
                    // File doesn't exist yet, return empty array context
                    return { content: [], sha: null };
                }
                throw new Error(`GitHub API Error: ${response.status}`);
            }

            const data = await response.json();
            // content is base64 encoded
            const decodedContent = decodeURIComponent(escape(atob(data.content)));
            
            return {
                content: JSON.parse(decodedContent),
                sha: data.sha
            };
        } catch (error) {
            console.error('Error fetching file from GitHub:', error);
            throw error;
        }
    },

    // Update file on github
    async updateFile(path, jsonContent, sha, message) {
        const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
        
        // encode to base64 safely (handling utf-8 check)
        const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(jsonContent, null, 2))));
        
        const body = {
            message: message,
            content: encodedContent,
            branch: this.branch
        };

        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Failed to update file: ${response.status}`);
        }

        return await response.json();
    },

    // Optional: Add simple user verification
    async verifyUser() {
        const response = await fetch('https://api.github.com/user', {
            headers: this.getHeaders()
        });
        return response.ok;
    }
};
