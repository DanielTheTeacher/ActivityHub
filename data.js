/**
 * Classroom OS - Shared Data Manager
 * Handles fetching and normalizing data from Google Sheets via CSV export.
 */

const DataManager = {
    // --- Configuration ---
    ACTIVITIES_SHEET_ID: '1LIzZKoPbOOqu2kGC9iasaw-RSEt_BYBrUGXJQAx9okw',
    TEXTBOOK_SHEET_ID: '1j9-YBfiV3Ke8jss_glGIT7Ah7uD5E-9PlYiY1N-yPO4',
    
    // Configured Tabs (GIDs)
    MASTER_INDEX_GID: '153689579',
    CHAPTERS_OVERVIEW_GID: '0',
    
    // Add all your activity tab names and GIDs here
    ACTIVITY_TABS: [
        { name: 'Warm-ups', gid: '0' },
        // Add more tabs as you build them out:
        // { name: 'Grammar', gid: '123456789' },
    ],

    // --- Core Fetching Logic ---
    async fetchCSV(sheetId, gid) {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status} on GID ${gid}`);
            const csvText = await response.text();
            
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: (error) => reject(error)
                });
            });
        } catch (error) {
            console.error(`Fetch failed for sheet ${sheetId} (GID: ${gid}):`, error);
            return [];
        }
    },

    // --- Normalization Helpers ---
    // Lowercases all keys and trims them to prevent breakages if headers change slightly
    normalizeRow(row) {
        const normalized = {};
        for (const [key, value] of Object.entries(row)) {
            const cleanKey = key.trim().toLowerCase();
            normalized[cleanKey] = value ? value.trim() : '';
        }
        return normalized;
    },

    // --- Specific Data Loaders ---
    
    async loadAllActivities() {
        const fetchPromises = this.ACTIVITY_TABS.map(async (tab, index) => {
            const rawData = await this.fetchCSV(this.ACTIVITIES_SHEET_ID, tab.gid);
            return rawData.map((row, rowIndex) => {
                const norm = this.normalizeRow(row);
                // Create reliable properties regardless of minor header changes
                return {
                    _internalId: `${tab.name.replace(/\s+/g, '-')}-${rowIndex}`,
                    id: norm['id'] || rowIndex.toString(),
                    name: norm['name'] || norm['activity name'] || 'Unnamed Activity',
                    category: norm['category'] || tab.name,
                    level: norm['level'] || '',
                    time: norm['time'] || '',
                    prep: norm['prep'] || '',
                    dynamic: norm['dynamic'] || '',
                    keywords: norm['keywords'] || '',
                    chapter: norm['chapter'] || '',
                    source: norm['source'] || '',
                    competencyAims: norm['competency aim'] || norm['competency aims'] || norm['kompetansemål'] || '',
                    instructions: (norm['teacher notes'] || norm['teacher instructions'] || '').replace(/\bSs\b/g, 'students'),
                    studentDesc: (norm['student description'] || norm['student instructions'] || norm['instructions'] || '').replace(/\bSs\b/g, 'students'),
                    rating: parseInt(norm['rating']) || 0,
                    reports: parseInt(norm['report problem'] || norm['report issue'] || norm['reports'] || norm['report']) || 0
                };
            }).filter(a => a.name !== 'Unnamed Activity');
        });

        const resultsArray = await Promise.all(fetchPromises);
        return resultsArray.flat();
    },

    async loadMasterIndex() {
        const rawData = await this.fetchCSV(this.TEXTBOOK_SHEET_ID, this.MASTER_INDEX_GID);
        return rawData.map(this.normalizeRow);
    },

    async loadChaptersOverview() {
        const rawData = await this.fetchCSV(this.TEXTBOOK_SHEET_ID, this.CHAPTERS_OVERVIEW_GID);
        return rawData.map(this.normalizeRow);
    },

    async loadBookTexts(bookGid) {
        const rawData = await this.fetchCSV(this.TEXTBOOK_SHEET_ID, bookGid);
        return rawData.map(this.normalizeRow);
    }
};