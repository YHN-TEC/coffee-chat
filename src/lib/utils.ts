import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { CommunicationPreference, ExperienceLevel, RoleType } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const communicationPreferenceLabels: Record<CommunicationPreference, string> = {
  ONLINE: "线上",
  OFFLINE: "线下",
  BOTH: "线上 / 线下都可以",
};

export const experienceLevelLabels: Record<ExperienceLevel, string> = {
  STUDENT: "学生 / 在读",
  EARLY: "0 - 2 年",
  MID: "3 - 5 年",
  SENIOR: "6 - 9 年",
  LEAD: "10 年以上 / 管理岗",
  EXECUTIVE: "负责人 / 高管",
};

export const roleTypeLabels: Record<RoleType, string> = {
  PRODUCT: "产品",
  ENGINEERING: "工程",
  DESIGN: "设计",
  FOUNDER: "创业者",
  INVESTOR: "投资",
  MARKETING: "市场 / 增长",
  RESEARCH: "研究 / 学术",
  OPERATIONS: "运营 / 分析",
  STUDENT: "学生",
  CREATOR: "创作者",
  FREELANCER: "自由职业",
  OTHER: "其他",
};

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "M 月 d 日 HH:mm", { locale: zhCN });
}

export function formatDateOnly(date: Date | string) {
  return format(new Date(date), "yyyy-MM-dd", { locale: zhCN });
}

export function getInitials(name: string) {
  return name
    .trim()
    .split("")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function parseCommaSeparated(value: string) {
  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
