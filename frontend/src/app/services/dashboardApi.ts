import { apiService } from './api';

export interface StatsItem {
    title: string;
    value: string;
    iconType: string;
    trend: string;
    trendUp: boolean;
    delay: number;
}

export interface PlatformDistribution {
    name: string;
    value: number;
    color: string;
}

export interface RecentPost {
    name: string;
    status: string;
    time: string;
}

export interface AIProcessResponse {
    transcript: string;
    titles: string[];
    thumbnails: string[];
    hashtags: string;
}

export interface DashboardDataResponse {
    stats: StatsItem[];
    platformDistribution: PlatformDistribution[];
    recentPosts: RecentPost[];
}

export interface Integration {
    platform: string;
    access_token: string;
    created_at: string;
    updated_at: string;
}

export interface AnalyticsDataResponse {
    weeklyData: any[];
    platformData: any;
    aggregateMetrics?: {
        totalFollowers: string;
        totalViews: string;
        avgEngagement: string;
        contentPosted: string;
    };
}

export const dashboardApi = {
    /**
     * Fetch all dashboard overview data (stats, charts, recent posts)
     */
    getDashboardData: async (): Promise<DashboardDataResponse> => {
        return apiService.get<DashboardDataResponse>('/dashboard/data');
    },

    /**
     * Fetch timeline charts and detailed platform analytics
     */
    getAnalyticsData: async (): Promise<AnalyticsDataResponse> => {
        return apiService.get<AnalyticsDataResponse>('/dashboard/analytics');
    },

    /**
     * Fetch all connected integrations for the current user
     */
    getIntegrations: async (): Promise<Integration[]> => {
        return apiService.get<Integration[]>('/dashboard/integrations');
    },

    /**
     * Add or update an API key for a specific platform
     */
    addIntegration: async (platform: string, apiKey: string): Promise<Integration> => {
        return apiService.post<Integration>('/dashboard/integrations', {
            platform,
            api_key: apiKey
        });
    },

    /**
     * Fetch real-time analytics for a specific video.
     */
    getVideoAnalytics: async (platform: string, videoId: string): Promise<any> => {
        return apiService.get<any>(`/dashboard/analytics/${platform}/${videoId}`);
    },

    /**
     * Delete an integration for a specific platform
     */
    deleteIntegration: async (platform: string): Promise<{ message: string }> => {
        return apiService.delete<{ message: string }>(`/dashboard/integrations/${platform}`);
    },

    /**
     * Send a video file to the backend AI service and receive transcript, caption, and thumbnail prompt.
     */
    generateAI: async (file: File): Promise<AIProcessResponse> => {
        const form = new FormData();
        form.append('file', file);
        return apiService.post<AIProcessResponse>('/ai/process', form);
    }
};
