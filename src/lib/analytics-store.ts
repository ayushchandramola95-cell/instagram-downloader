import fs from "fs";
import path from "path";

export interface ActivityEvent {
  id: string;
  type: "download" | "fetch" | "visit";
  format?: string;
  quality?: string;
  timestamp: string;
  ipMasked?: string;
}

export interface AnalyticsData {
  totalVisits: number;
  totalDownloads: number;
  downloadsByType: Record<string, number>;
  trafficSources: Record<string, number>;
  recentActivity: ActivityEvent[];
  dailyStats: { date: string; visits: number; downloads: number }[];
}

const DATA_PATH = path.join(process.cwd(), "src", "data", "analytics.json");

function maskIp(ip?: string): string {
  if (!ip) return "anonymous";
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip.substring(0, 8) + "...";
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const content = await fs.promises.readFile(DATA_PATH, "utf-8");
      return JSON.parse(content) as AnalyticsData;
    }
  } catch (err) {
    console.error("Error reading analytics.json:", err);
  }

  return {
    totalVisits: 0,
    totalDownloads: 0,
    downloadsByType: {
      reel: 0,
      video: 0,
      story: 0,
      photo: 0,
      audio: 0,
      carousel: 0,
    },
    trafficSources: {
      direct: 0,
      google: 0,
      bing: 0,
      instagram: 0,
      bookmarklet: 0,
    },
    recentActivity: [],
    dailyStats: [],
  };
}

export async function resetAnalyticsData(): Promise<AnalyticsData> {
  const cleanData: AnalyticsData = {
    totalVisits: 0,
    totalDownloads: 0,
    downloadsByType: {
      reel: 0,
      video: 0,
      story: 0,
      photo: 0,
      audio: 0,
      carousel: 0,
    },
    trafficSources: {
      direct: 0,
      google: 0,
      bing: 0,
      instagram: 0,
      bookmarklet: 0,
    },
    recentActivity: [],
    dailyStats: [],
  };
  await saveAnalyticsData(cleanData);
  return cleanData;
}

export async function saveAnalyticsData(data: AnalyticsData): Promise<boolean> {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    const tempPath = `${DATA_PATH}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
    await fs.promises.rename(tempPath, DATA_PATH);
    return true;
  } catch (err) {
    console.error("Error saving analytics.json:", err);
    return false;
  }
}

export async function recordDownloadEvent(format: string, quality: string, clientIp?: string) {
  try {
    const data = await getAnalyticsData();
    data.totalDownloads = (data.totalDownloads || 0) + 1;

    const normalizedFormat = format.toLowerCase().trim() || "other";
    data.downloadsByType[normalizedFormat] = (data.downloadsByType[normalizedFormat] || 0) + 1;

    const today = new Date().toISOString().split("T")[0];
    const todayStat = data.dailyStats.find((d) => d.date === today);
    if (todayStat) {
      todayStat.downloads += 1;
    } else {
      data.dailyStats.push({ date: today, visits: 1, downloads: 1 });
      if (data.dailyStats.length > 30) data.dailyStats.shift();
    }

    const newEvent: ActivityEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: "download",
      format: normalizedFormat,
      quality,
      timestamp: new Date().toISOString(),
      ipMasked: maskIp(clientIp),
    };

    data.recentActivity.unshift(newEvent);
    if (data.recentActivity.length > 50) {
      data.recentActivity = data.recentActivity.slice(0, 50);
    }

    await saveAnalyticsData(data);
  } catch (e) {
    console.error("Failed to record download event:", e);
  }
}

export async function recordVisitEvent(source = "direct", clientIp?: string) {
  try {
    const data = await getAnalyticsData();
    data.totalVisits = (data.totalVisits || 0) + 1;

    const src = source.toLowerCase();
    data.trafficSources[src] = (data.trafficSources[src] || 0) + 1;

    const today = new Date().toISOString().split("T")[0];
    const todayStat = data.dailyStats.find((d) => d.date === today);
    if (todayStat) {
      todayStat.visits += 1;
    } else {
      data.dailyStats.push({ date: today, visits: 1, downloads: 0 });
      if (data.dailyStats.length > 30) data.dailyStats.shift();
    }

    await saveAnalyticsData(data);
  } catch (e) {
    console.error("Failed to record visit event:", e);
  }
}
