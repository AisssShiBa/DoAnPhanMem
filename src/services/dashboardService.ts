import api from "../lib/axios";

export interface DashboardSummary {
  totalTasks: number;
  doneTasks: number;
  pendingTasks: number;
  completionRate: number;
  doneThisWeek: number;
  doneThisMonth: number;
  overdueCount: number;
}

export interface UpcomingTask {
  id: number;
  title: string;
  due_date: string | null;
  priority: number | null;
  category?: {
    id: number;
    name: string;
    color_code: string;
  } | null;
}

export interface CategoryStat {
  id: number;
  name: string;
  color_code: string | null;
  total: number;
  done: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  upcomingTasks: UpcomingTask[];
  categoryStats: CategoryStat[];
}

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await api.get("/dashboard");
    return res.data;
  },

  getWeeklyPerformance: async () => {
    const res = await api.get("/dashboard/weekly");
    return res.data;
  },
};
